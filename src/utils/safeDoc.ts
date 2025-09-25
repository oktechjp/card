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
import words from "./words.json" assert { type: "json" };
import permutations from './permutations.json' assert { type: 'json' };

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

export function getPossibleDocKey(input: string) {
  const key = sanitizeCrockfordBase32(input, false);
  if (!key) {
    return null;
  }
  if (key.length !== 23) {
    return null;
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

export function createPrivateKey(type: "base32" | "words" = "base32") {
  if (type === "words") {
    return createPrivateWordsKey();
  }
  return createPrivateBase32Key();
}

const bufferForMaxInt = new Map<number, Uint8Array>();

function getSecureRandomInt(options: number) {
  let buffer = bufferForMaxInt.get(options);
  if (!buffer) {
    let uint8s = 1;
    let num = 256;
    while (num < options) {
      uint8s += 1;
      num *= 256;
    }
    buffer = new Uint8Array(uint8s);
    bufferForMaxInt.set(options, buffer);
  }
  crypto.getRandomValues(buffer);
  let multiplyBy = 1;
  let res = 0;
  for (let uint8 of buffer) {
    res += uint8 * multiplyBy;
    multiplyBy *= 256;
  }
  return res % options;
}

function getRandomEntry<T>(array: T[]): T {
  return array[getSecureRandomInt(array.length)];
}

class RandomWeighted<T extends { weight: number }> {
  total: number;
  sections: Array<{ group: T; max: number }>;

  constructor(groups: T[]) {
    this.total = groups.reduce((total, { weight }) => total + weight, 0);
    let max = 0;
    this.sections = groups.map((group) => {
      max += group.weight;
      return {
        group,
        max,
      };
    });
  }
  getRandom(): T {
    const i = getSecureRandomInt(this.total);
    for (const { group, max } of this.sections) {
      if (i < max) {
        return group;
      }
    }
    return this.sections[0].group;
  }
}

const weighted = new RandomWeighted(
  permutations.map((indices) => {
    const listOfWords = indices.map((index) => words[index]);
    return {
      listOfWords,
      weight: listOfWords.reduce((total, set) => total * set.length, 1),
    };
  })
)

export function createPrivateWordsKey() {
  return weighted.getRandom().listOfWords.map((words) => getRandomEntry(words)).join("-");
}

export function createPrivateBase32Key() {
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
  encryptedJson: string;
  prCreateLink: string;
  prUpdateAction: MouseEventHandler;
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
