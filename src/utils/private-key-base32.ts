import { crockfordBase32 } from "@/utils/codecs/crockford-base32";

function toReadableHash(input: Uint8Array) {
  const c = crockfordBase32.encode(input);
  return (c.match(/.{5}/g) ?? []).join("-");
}

export function createPrivateKeyBase32() {
  return toReadableHash(crypto.getRandomValues(new Uint8Array(12)));
}
