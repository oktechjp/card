import { toCrockfordBase32 } from "./buffer";

function toReadableHash(input: Uint8Array) {
  const c = toCrockfordBase32(input);
  return (c.match(/.{5}/g) ?? []).join("-");
}

export function createPrivateKeyBase32() {
  return toReadableHash(crypto.getRandomValues(new Uint8Array(12)));
}
