import {
  crockfordBase32,
  sanitizeCrockfordBase32,
  splitBase32,
} from "@/utils/codecs/crockford-base32";
import type { PasswordGenerator, RandomSource } from "@/utils/crypto";

function toReadableHash(input: Uint8Array) {
  const c = crockfordBase32.encode(input);
  return splitBase32(c);
}

export function getPossibleBase32Password(
  input: string,
  size: number,
): string | undefined {
  const key = sanitizeCrockfordBase32(input, false);
  if (!key) {
    return undefined;
  }
  if (key.length !== size) {
    return undefined;
  }
  return key;
}

class RandomBase32 implements PasswordGenerator {
  private buffer: Uint8Array;
  targetLength: number;
  entropyNeeded: number;
  entropyProvided: number;

  constructor(
    public humanName: string,
    bytes: number,
  ) {
    const bits = bytes * 8;
    const buffer = new Uint8Array(bytes);
    this.buffer = buffer;
    this.targetLength = toReadableHash(buffer).length;
    this.entropyNeeded = bits;
    this.entropyProvided = bits;
  }

  getPossiblePassword(input: string): string | undefined {
    return getPossibleBase32Password(input, this.targetLength);
  }

  getRandom(random: RandomSource) {
    return toReadableHash(random.getBytes(this.buffer));
  }
}

export const passwordBase32 = new RandomBase32("Base 32", 16);
