import {
  decodeJSON,
  encode,
  encodeJSON,
  fromBase64,
  sanitizeCrockfordBase32,
  toBase64,
  toCrockfordBase32,
} from "./buffer";
import type { JSONObj } from "./form";
import type { MouseEventHandler } from "react";

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

async function deriveEncryptionKey(secret: string | Uint8Array<ArrayBuffer>) {
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
    key = deriveEncryptionKey(PAGE_KEY);
    return await key;
  };
})();

interface EncryptedDocumentWrapper {
  content: string;
}

export async function decryptDocument(
  privateKey: string,
  json: EncryptedDocumentWrapper,
) {
  const encryptionKey = await deriveEncryptionKey(privateKey);
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

export function getPossibleDocKey(input: string) {
  return getPossibleBase32Key(input) ?? getPossibleWordsKey(input);
}

function getPossibleWordsKey(input: string) {
  if (/^[a-z-]{38}/.test(input)) {
    return input;
  }
}

function getPossibleBase32Key(input: string) {
  const key = sanitizeCrockfordBase32(input, false);
  if (!key) {
    return undefined;
  }
  if (key.length !== 23) {
    return undefined;
  }
  return key;
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

export async function encryptDocument(
  docKey: string,
  type: string,
  version: number,
  data: JSONObj,
): Promise<{
  fileName: string;
  link: string;
  encrypted: EncryptedDocumentWrapper;
  encryptedJson: string;
  prCreateLink: string;
  prUpdateAction: MouseEventHandler;
  docKey: string;
}> {
  const time = new Date().toISOString();
  const encryptionKey = await deriveEncryptionKey(docKey);
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
  const encryptedJson = JSON.stringify(encrypted, null, 2);
  const prCreateURL = new URL(
    `https://github.com/oktechjp/public/new/main/docs`,
  );
  prCreateURL.searchParams.append("filename", fileName);
  prCreateURL.searchParams.append("value", encryptedJson);
  const prUpdateURL = new URL(
    `https://github.com/oktechjp/public/edit/main/docs/${publicKey}.json`,
  );
  prUpdateURL.searchParams.append("value", encryptedJson);
  return {
    docKey,
    fileName,
    link: `${LINK_PREFIX}${docKey}`,
    prCreateLink: prCreateURL.toString(),
    prUpdateAction: () => {
      const clipboard = globalThis.navigator?.clipboard;
      if (!clipboard) {
        alert("todo");
        return;
      }
      (async () => {
        await clipboard.writeText(encryptedJson);
        if (
          !confirm(`Github doesnt support pre-filling the changed content. :-(`)
        ) {
          return;
        }
        if (!confirm(`The new content is now in your clipboard!`)) {
          return;
        }
        if (!confirm(`After sending okay we will redirect you to github!`)) {
          return;
        }
        if (!confirm(`Paste the content on the next site into github!`)) {
          return;
        }
        window.open(prUpdateURL.toString(), "_blank");
      })().catch((err) => {
        console.error(err);
        alert("Something went wrong :-(");
      });
    },
    encrypted,
    encryptedJson,
  };
}
