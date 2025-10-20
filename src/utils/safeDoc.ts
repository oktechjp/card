import z, { type output } from "zod/v4";
import type {
  DocCodec,
  JSONDocument,
  WorkDocument,
  DocTypeDefinition,
} from "@/utils/codecs";
import { codecs } from "@/utils/codecs";
import { uniqueRequests } from "@/utils/requests";
import { passwordGenerators } from "./password-generators";
import { autoLru } from "./lru";

export {
  createDocCodec,
  type Page,
  type DocCodec,
  type WorkDocument,
  type Codec,
  type DocTypeDefinition,
} from "@/utils/codecs";

const PAGE_SALT = codecs.base64.decode("Ljeijq98ZyaFa5NV");
const DERIVE = {
  name: "PBKDF2",
  salt: PAGE_SALT,
  iterations: Math.pow(2, 16),
  hash: "SHA-256",
} as const satisfies Pbkdf2Params;
const ENCRYPT = {
  params: {
    name: "AES-GCM",
    iv: PAGE_SALT,
  } satisfies AesGcmParams,
  basekey: {
    name: "AES-GCM",
    length: 256,
  } satisfies AesDerivedKeyParams,
} as const;

const derivationKeys = autoLru(10, (secretBase64) =>
  crypto.subtle.importKey(
    "raw",
    codecs.base64.decode(secretBase64),
    DERIVE.name,
    false,
    ["deriveKey", "deriveBits"],
  ),
);
const encryptionKeys = autoLru(
  10,
  async (privateKeyBase64) =>
    await crypto.subtle.deriveKey(
      DERIVE,
      await derivationKeys.get(privateKeyBase64),
      ENCRYPT.basekey,
      false,
      ["encrypt", "decrypt"],
    ),
);
async function encrypt(
  privateKeyBase64: string,
  content: Uint8Array<ArrayBuffer>,
) {
  return new Uint8Array(
    await crypto.subtle.encrypt(
      ENCRYPT.params,
      await encryptionKeys.get(privateKeyBase64),
      content,
    ),
  );
}

export const EncryptedDocSchema = z.object({
  content: z.base64(),
});

export type EncryptedDoc = output<typeof EncryptedDocSchema>;

async function decryptDocument(
  privateKeyBase64: string,
  { content }: output<typeof EncryptedDocSchema>,
) {
  const base = await crypto.subtle.decrypt(
    ENCRYPT.params,
    await encryptionKeys.get(privateKeyBase64),
    codecs.base64.decode(content),
  );
  return codecs.json.decode(new Uint8Array(base));
}

const publicKeys = autoLru(10, async (privateKeyBase64) =>
  codecs.crockfordBase32.encode(
    new Uint8Array(
      await crypto.subtle.deriveBits(
        {
          ...DERIVE,
          //
          // Passwords are set to provide 96 bits of entropy.
          // For 128 bit to be safe for brute force attacks we need 2^(120-96) or 2^32 iterations.
          //
          // See section A.2.2 of NIST SP 800-132 - https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf
          //
          // That said, 2^32 operations exceed the 2^32-1 limit of PBKDF2 and for it to be practically usable
          // we need to limit ourselves to 2^22 operations for a brute force complexity equal to 118bit of entropy.
          //
          // With 118bit considering https://bruteforce.bitsnbites.eu/ the computation time should still be practically
          // unreachable.
          //
          iterations: Math.pow(2, 22),
        },
        await derivationKeys.get(privateKeyBase64),
        128,
      ),
    ),
  ),
);

export function getPossibleDocKey(input: string): string | undefined {
  for (const generator of passwordGenerators) {
    const key = generator.getPossiblePassword(input);
    if (key !== undefined) {
      return key;
    }
  }
}

export interface ParsedDocument<
  T extends DocTypeDefinition = DocTypeDefinition,
> {
  type: T;
  docKey: string;
  data: output<T["schema"]>;
  time: Date;
}

const utf8ToBase64 = (input: string) =>
  codecs.base64.encode(codecs.utf8.encode(input));

export async function fetchDocument(
  docKey: string,
  codec: DocCodec,
): Promise<WorkDocument> {
  if (codec.types.length === 0) {
    throw new Error(`No Codecs defined to load`);
  }
  const storageKey = await publicKeys.get(utf8ToBase64(docKey));
  //
  // Requests may be the same for different types,
  // in case the location is the same, we need to load
  // them only once and afterwards look in the data for the type
  //
  const requests = await uniqueRequests(
    codec.types.map((type) => type.createStorageRequest(storageKey)),
  );
  let cause: Error | undefined = undefined;
  for (const request of requests) {
    let text: string;
    try {
      const res = await fetch(request);
      if (res.status !== 200) {
        throw new Error(`Invalid response: ${res.status}`);
      }
      text = await res.text();
    } catch (cause) {
      cause = cause instanceof Error ? cause : new Error(String(cause));
      continue;
    }
    let json;
    try {
      json = EncryptedDocSchema.parse(JSON.parse(text));
    } catch (cause) {
      throw new Error(`Invalid document: ${text}`, { cause });
    }
    return codec.decode({
      docKey,
      doc: await decryptDocument(
        codecs.base64.encode(codecs.utf8.encode(docKey)),
        json,
      ),
    });
  }
  throw new Error(`Document not found`, { cause });
}

export async function encryptDocument(input: JSONDocument): Promise<{
  publicKey: string;
  encrypted: EncryptedDoc;
}> {
  const docKeyB64 = utf8ToBase64(input.docKey);
  const [publicKey, contentBuffer] = await Promise.all([
    publicKeys.get(docKeyB64),
    encrypt(docKeyB64, codecs.json.encode(input.doc)),
  ] as const);
  return {
    publicKey,
    encrypted: {
      content: codecs.base64.encode(contentBuffer),
    },
  };
}
