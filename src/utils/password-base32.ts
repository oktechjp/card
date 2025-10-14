import { crockfordBase32 } from "@/utils/codecs/crockford-base32";
import type { PasswordGenerator, RandomSource } from "@/utils/crypto";

function toReadableHash(input: Uint8Array) {
  const c = crockfordBase32.encode(input);
  return (c.match(/.{5}/g) ?? []).join("-");
}

class RandomBase32 implements PasswordGenerator {
  private buffer: Uint8Array;
  targetLength: number;
  entropyNeeded: number;
  entropyProvided: number;

  constructor(bytes: number) {
    const bits = bytes * 8;
    const buffer = new Uint8Array(bytes);
    this.buffer = buffer;
    this.targetLength = toReadableHash(buffer).length;
    this.entropyNeeded = bits;
    this.entropyProvided = bits;
  }

  getRandom(random: RandomSource) {
    return toReadableHash(random.getBytes(this.buffer));
  }
}

export const passwordBase32 = new RandomBase32(12);
