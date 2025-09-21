import { DOC_TYPE, DOC_VERSION } from "@/docs/card";
import {
  decodeJSON,
  encode,
  encodeJSON,
  fromBase64,
  toBase64,
  toCrockfordBase32,
} from "./buffer";
import type { JSONObj } from "./form";

const ENCRYPT_ALGO = "AES-GCM";
const ENCRYPT_LEN = 256;
const PAGE_SALT = new Uint8Array([
  46, 55, 162, 142, 175, 124, 103, 38, 133, 107, 147, 85,
]);
const PAGE_KEY = new Uint8Array([
  226, 196, 13, 158, 36, 191, 211, 94, 53, 177, 201, 188,
]);
const LINK_PREFIX = "https://card.oktech.jp#";
const DOC_PREFIX = "https://public.oktech.jp/docs/";

async function createKey(secret: string | Uint8Array<ArrayBuffer>) {
  if (typeof secret == "string") {
    secret = encode(secret);
  }
  const deriveKey = await crypto.subtle.importKey(
    "raw",
    secret,
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: PAGE_SALT,
      iterations: 100000,
      hash: "SHA-256",
    },
    deriveKey,
    { name: ENCRYPT_ALGO, length: ENCRYPT_LEN },
    false,
    ["encrypt", "decrypt"],
  );
}

const getPageEncryptKey = (() => {
  let key: Promise<CryptoKey>;
  return async () => {
    if (key) return await key;
    key = createKey(PAGE_KEY);
    return await key;
  };
})();

function toReadableHash(input: Uint8Array) {
  const c = toCrockfordBase32(input);
  return (c.match(/.{5}/g) ?? []).join("-");
}

interface EncryptedDocumentWrapper {
  content: string;
}

export async function decryptDocument(
  privateKey: string,
  json: EncryptedDocumentWrapper,
) {
  const encryptionKey = await createKey(privateKey);
  const base = await crypto.subtle.decrypt(
    { name: ENCRYPT_ALGO, iv: PAGE_SALT },
    encryptionKey,
    fromBase64(json.content),
  );
  return decodeJSON(new Uint8Array(base));
}

export async function toPublicKey(privateKey: string) {
  const encryptKey = await getPageEncryptKey();
  return toCrockfordBase32(
    new Uint8Array(
      await crypto.subtle.encrypt(
        { name: encryptKey.algorithm.name, iv: PAGE_SALT },
        encryptKey,
        encode(privateKey),
      ),
    ),
  );
}

export function isPossibleDocKey(input: string) {
  return /^([0Oo1IiLl23456789AaBbCcDdEeFfGgHhJjKkMmNnPpQqRrSsTtVvWwXxYyZ]{5}-[0Oo1IiLl23456789AaBbCcDdEeFfGgHhJjKkMmNnPpQqRrSsTtVvWwXxYyZ]{5}-[0Oo1IiLl23456789AaBbCcDdEeFfGgHhJjKkMmNnPpQqRrSsTtVvWwXxYyZ]{5}-[0Oo1IiLl23456789AaBbCcDdEeFfGgHhJjKkMmNnPpQqRrSsTtVvWwXxYyZ]{5})$/.test(
    input,
  );
}

export async function fetchDocument(privateKey: string) {
  try {
    const publicKey = await toPublicKey(privateKey);
    const res = await fetch(`${DOC_PREFIX}${publicKey}.json`);
    if (res.status !== 200) {
      throw new Error(`Invalid response: ${res.status}`);
    }
    let json;
    try {
      json = await res.json();
    } catch (cause) {
      throw new Error(`Invalid document`, { cause });
    }
    if (!("content" in json)) {
      throw new Error(`Invalid JSON data`);
    }
    return await decryptDocument(privateKey, json);
  } catch (cause) {
    throw new Error("Not found", { cause });
  }
}

export function getLocalStorageDocKey(privateKey: string) {
  return `privateKey:${privateKey}`;
}

export function createPrivateKey() {
  return toReadableHash(crypto.getRandomValues(new Uint8Array(12)));
}

export async function encryptDocument(
  docKey: string,
  type: string,
  version: number,
  data: JSONObj,
): Promise<{
  fileName: string;
  link: string;
  encrypted: EncryptedDocumentWrapper;
  prLink: string;
  docKey: string;
}> {
  const time = new Date().toISOString();
  const encryptionKey = await createKey(docKey);
  const publicKey = await toPublicKey(docKey);
  const json = {
    type,
    version,
    time,
    data,
  };
  const encrypted = {
    content: toBase64(
      await new Uint8Array(
        await crypto.subtle.encrypt(
          { name: ENCRYPT_ALGO, iv: PAGE_SALT },
          encryptionKey,
          encodeJSON(json),
        ),
      ),
    ),
  };
  const fileName = `${publicKey}.json`;
  const prURL = new URL(`https://github.com/oktechjp/public/new/main/docs`);
  prURL.searchParams.append("filename", fileName);
  prURL.searchParams.append("value", JSON.stringify(encrypted, null, 2));
  return {
    docKey,
    fileName,
    link: `${LINK_PREFIX}${docKey}`,
    prLink: prURL.toString(),
    encrypted,
  };
}
