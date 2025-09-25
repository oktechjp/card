import {
  sanitizeCrockfordBase32,
  crockfordBase32,
} from "@/utils/codecs/crockford-base32";
import type { JSONObj } from "@/utils/form";
import type { MouseEventHandler } from "react";
import { codecs } from "@/utils/codecs";

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

const LINK_PREFIX = "https://card.oktech.jp#";
const DOC_PREFIX = "https://public.oktech.jp/docs/";

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

interface EncryptedDocumentWrapper {
  content: string;
}

export async function decryptDocument(
  privateKey: string,
  { content }: EncryptedDocumentWrapper,
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

async function toPublicKey(privateKey: string) {
  return crockfordBase32.encode(
    await encrypt(PAGE_KEY, codecs.utf8.encode(privateKey)),
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

async function encrypt(
  privateKey: Uint8Array<ArrayBuffer>,
  content: Uint8Array<ArrayBuffer>,
) {
  const encryptionKey = await deriveEncryptionKey(privateKey);
  return new Uint8Array(
    await crypto.subtle.encrypt(ENCRYPT.params, encryptionKey, content),
  );
}

export interface EncryptedDocument {
  fileName: string;
  link: string;
  encrypted: EncryptedDocumentWrapper;
  encryptedJson: string;
  prCreateLink: string;
  prUpdateAction: MouseEventHandler;
  docKey: string;
}
export async function encryptDocument(
  docKey: string,
  type: string,
  version: number,
  data: JSONObj,
): Promise<EncryptedDocument> {
  const time = new Date().toISOString();
  const publicKey = await toPublicKey(docKey);
  const document = {
    type,
    version,
    time,
    data,
  };
  const encrypted = {
    content: codecs.base64.encode(
      await encrypt(codecs.utf8.encode(docKey), codecs.json.encode(document)),
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
