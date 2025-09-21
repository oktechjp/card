// Adapted from https://github.com/beatgammit/base64-js/blob/83f04b074694929d205171f48ad79a4e073e8429/index.js
const code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const lookup = Array.from(code);
const revLookup = Object.fromEntries(
  lookup.entries().map(([i, char]) => [char.charCodeAt(0), i]),
);

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup["-".charCodeAt(0)] = 62;
revLookup["_".charCodeAt(0)] = 63;

function getLens(b64: string) {
  const len = b64.length;

  if (len % 4 > 0) {
    throw new Error("Invalid string. Length must be a multiple of 4");
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  let validLen = b64.indexOf("=");
  if (validLen === -1) validLen = len;

  const placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);

  return [validLen, placeHoldersLen];
}

// base64 is 4/3 + up to two characters of the original data
function byteLength(b64: string) {
  const [validLen, placeHoldersLen] = getLens(b64);
  return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen;
}

function _byteLength(b64: string, validLen: number, placeHoldersLen: number) {
  return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen;
}

export function fromBase64(b64: string) {
  let tmp: number;
  const [validLen, placeHoldersLen] = getLens(b64);

  const arr = new Uint8Array(_byteLength(b64, validLen, placeHoldersLen));

  let curByte = 0;

  // if there are placeholders, only get up to the last complete 4 chars
  const len = placeHoldersLen > 0 ? validLen - 4 : validLen;

  let i;
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)];
    arr[curByte++] = (tmp >> 16) & 0xff;
    arr[curByte++] = (tmp >> 8) & 0xff;
    arr[curByte++] = tmp & 0xff;
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4);
    arr[curByte++] = tmp & 0xff;
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2);
    arr[curByte++] = (tmp >> 8) & 0xff;
    arr[curByte++] = tmp & 0xff;
  }

  return arr;
}

function tripletToBase64(num: number) {
  return (
    lookup[(num >> 18) & 0x3f] +
    lookup[(num >> 12) & 0x3f] +
    lookup[(num >> 6) & 0x3f] +
    lookup[num & 0x3f]
  );
}

function encodeChunk(uint8: Uint8Array, start: number, end: number) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xff0000) +
      ((uint8[i + 1] << 8) & 0xff00) +
      (uint8[i + 2] & 0xff);
    output.push(tripletToBase64(tmp));
  }
  return output.join("");
}

export function toBase64(uint8: Uint8Array) {
  let tmp;
  const len = uint8.length;
  const extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
  const parts = [];
  const maxChunkLength = 16383; // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (let i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(
      encodeChunk(
        uint8,
        i,
        i + maxChunkLength > len2 ? len2 : i + maxChunkLength,
      ),
    );
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    parts.push(lookup[tmp >> 2] + lookup[(tmp << 4) & 0x3f] + "==");
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    parts.push(
      lookup[tmp >> 10] +
        lookup[(tmp >> 4) & 0x3f] +
        lookup[(tmp << 2) & 0x3f] +
        "=",
    );
  }

  return parts.join("");
}

export const encode = (input: string) => new TextEncoder().encode(input);
export const encodeJSON = (input: any) => encode(JSON.stringify(input));

const c32 = Array.from("0123456789ABCDEFGHJKMNPQRSTVWXYZ");

export function toCrockfordBase32(input: Uint8Array) {
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

export const decodeJSON = (input: Uint8Array) =>
  JSON.parse(new TextDecoder().decode(input));
 