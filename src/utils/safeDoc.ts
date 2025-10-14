import z, { type output } from "zod/v4";
import {
  sanitizeCrockfordBase32,
  crockfordBase32,
} from "@/utils/codecs/crockford-base32";
import type {
  DocCodec,
  JSONDocument,
  WorkDocument,
  DocTypeDefinition,
} from "@/utils/codecs";
import { codecs } from "@/utils/codecs";
import { uniqueRequests } from "@/utils/requests";
import { passwordGenerators } from "./password-generators";

export {
  createDocCodec,
  type Page,
  type DocCodec,
  type WorkDocument,
  type Codec,
  type DocTypeDefinition,
} from "@/utils/codecs";

const PAGE_SALT = codecs.base64.decode("Ljeijq98ZyaFa5NV");
const PAGE_KEY = codecs.base64.decode("4sQNniS/0141scm8");
const DERIVE = {
  name: "PBKDF2",
  salt: PAGE_SALT,
  iterations: 100000,
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

async function deriveEncryptionKey(secret: Uint8Array<ArrayBuffer>) {
  const deriveKey = await crypto.subtle.importKey(
    "raw",
    secret,
    DERIVE.name,
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(DERIVE, deriveKey, ENCRYPT.basekey, false, [
    "encrypt",
    "decrypt",
  ]);
}

async function encrypt(
  privateKey: Uint8Array<ArrayBuffer>,
  content: Uint8Array<ArrayBuffer>,
) {
  const encryptionKey = await deriveEncryptionKey(privateKey);
  return new Uint8Array(
    await crypto.subtle.encrypt(ENCRYPT.params, encryptionKey, content),
  );
}

export const EncryptedDocSchema = z.object({
  content: z.base64(),
});

export type EncryptedDoc = output<typeof EncryptedDocSchema>;

export async function decryptDocument(
  privateKey: string,
  { content }: output<typeof EncryptedDocSchema>,
) {
  const encryptionKey = await deriveEncryptionKey(
    codecs.utf8.encode(privateKey),
  );
  const base = await crypto.subtle.decrypt(
    ENCRYPT.params,
    encryptionKey,
    codecs.base64.decode(content),
  );
  return codecs.json.decode(new Uint8Array(base));
}

export async function toPublicKey(privateKey: string) {
  return crockfordBase32.encode(
    await encrypt(PAGE_KEY, codecs.utf8.encode(privateKey)),
  );
}

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

export async function fetchDocument(
  docKey: string,
  codec: DocCodec,
): Promise<WorkDocument> {
  if (codec.types.length === 0) {
    throw new Error(`No Codecs defined to load`);
  }
  const storageKey = await toPublicKey(docKey);
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
      doc: await decryptDocument(docKey, json),
    });
  }
  throw new Error(`Document not found`, { cause });
}

export async function encryptDocument(input: JSONDocument): Promise<{
  publicKey: string;
  encrypted: EncryptedDoc;
}> {
  const [publicKey, contentBuffer] = await Promise.all([
    toPublicKey(input.docKey),
    encrypt(codecs.utf8.encode(input.docKey), codecs.json.encode(input.doc)),
  ] as const);
  return {
    publicKey,
    encrypted: {
      content: codecs.base64.encode(contentBuffer),
    },
  };
}
