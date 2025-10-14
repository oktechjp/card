import { crockfordBase32 } from "@/utils/codecs/crockford-base32";
import type { PasswordGenerator, RandomSource } from "@/utils/crypto";

function toReadableHash(input: Uint8Array) {
  const c = crockfordBase32.encode(input);
  const middle = Math.floor(c.length / 2);
  const quart = Math.floor(middle / 2);
  const secondQuart = middle + Math.floor((c.length - middle) / 2);
  return (
    c.substring(0, quart) +
    "-" +
    c.substring(quart, middle) +
    "-" +
    c.substring(middle, secondQuart) +
    "-" +
    c.substring(secondQuart)
  );
}

class RandomBase32 implements PasswordGenerator {
  private buffer: Uint8Array;
  targetLength: number;
  entropyNeeded: number;
  entropyProvided: number;

  constructor(public humanName: string, bytes: number) {
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

export const passwordBase32 = new RandomBase32("Base 32", 12);
