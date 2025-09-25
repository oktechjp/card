import type { Codec } from "./codec";

const c32Dict = [
  "0Oo",
  "1IiLl",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "Aa",
  "Bb",
  "Cc",
  "Dd",
  "Ee",
  "Ff",
  "Gg",
  "Hh",
  "Jj",
  "Kk",
  "Mm",
  "Nn",
  "Pp",
  "Qq",
  "Rr",
  "Ss",
  "Tt",
  "Vv",
  "Ww",
  "Xx",
  "Yy",
  "Zz",
];
const c32 = c32Dict.map((chars) => chars[0]);
const c32Lookup = c32Dict.reduce(
  (lookup, chars, value) => {
    for (const char of chars) {
      lookup[char] = value;
    }
    return lookup;
  },
  {} as Record<string, number>,
);

function encode(input: Uint8Array) {
  const output: number[] = [];
  let bitsRead = 0;
  let buffer = 0;

  for (const byte of input) {
    // Add current byte to start of buffer
    buffer = (buffer << 8) | byte;
    bitsRead += 8;

    while (bitsRead >= 5) {
      output.push((buffer >>> (bitsRead - 5)) & 0x1f);
      bitsRead -= 5;
    }
  }

  if (bitsRead > 0) {
    output.push((buffer << (5 - bitsRead)) & 0x1f);
  }

  return output.map((byte) => c32[byte]).join("");
}

export function sanitizeCrockfordBase32(
  input: string,
  ignoreUnknown: true,
): string;
export function sanitizeCrockfordBase32(
  input: string,
  ignoreUnknown: false,
): null | string;
export function sanitizeCrockfordBase32(input: string, ignoreUnknown: boolean) {
  let sane = "";
  let count = 0;
  for (const char of input) {
    const validChar = c32Lookup[char];
    if (char === "-") {
      continue;
    }
    if (validChar !== undefined) {
      if (count % 5 === 0 && count !== 0) {
        sane += "-";
      }
      count += 1;
      sane += c32[validChar];
    } else if (!ignoreUnknown) {
      return null;
    }
  }
  return sane;
}

function decode(input: string) {
  const result = new Uint8Array(Math.ceil((input.length * 5) / 8));
  let bits = 0;
  let num = 0;
  let off = 0;
  for (const char of input) {
    if (char === "-") {
      continue;
    }
    const lookup = c32Lookup[char];
    if (lookup === undefined) {
      throw new Error("Unexpected character. Not decodable");
    }
    num = (num << 5) | lookup;
    bits += 5;
    if (bits >= 8) {
      result[off++] = (num >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  return result;
}

export const crockfordBase32 = {
  decode,
  encode,
} satisfies Codec<Uint8Array<ArrayBuffer>, string>;
