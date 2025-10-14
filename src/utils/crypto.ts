const bitsForNumber = new Map<number | bigint, number>();

export interface RandomSource {
  getBits(bits: number): number;
  getBigBits(bits: number): bigint;
  getBytes<input extends Uint8Array>(bytes: input): input;
}

export function createRandom(bytes: number): () => RandomSource {
  const random = crypto.getRandomValues(new Uint8Array(bytes));
  return () => {
    const iter = (function* () {
      for (const byte of random) {
        let bit = 0;
        let map = 1;
        while (bit < 8) {
          yield (byte & map) >> bit;
          bit += 1;
          map = map << 1;
        }
      }
      throw new Error(`Random source only exposes ${bytes} bytes of random.`);
    })();
    const getBigBits = (bits: number) => {
      let res = BigInt(0);
      for (let bit = 0; bit < bits; bit++) {
        const nextValue = iter.next().value;
        res += BigInt(nextValue) << BigInt(bit);
      }
      return res;
    };
    const getBits = (bits: number) => {
      let res = 0;
      for (let bit = 0; bit < bits; bit++) {
        const nextValue = iter.next().value;
        res += nextValue << bit;
      }
      return res;
    };
    return {
      getBytes(input) {
        for (let byte = 0; byte < input.length; byte++) {
          input[byte] = getBits(8);
        }
        return input;
      },
      getBigBits,
      getBits,
    };
  };
}

export function bitsNeeded(number: number | bigint) {
  let bits = bitsForNumber.get(number);
  if (bits === undefined) {
    bits = 1;
    let num = 2;
    while (num < number) {
      bits += 1;
      num *= 2;
    }
    bitsForNumber.set(number, bits);
  }
  return bits;
}

export function bitsProvided(number: number | bigint) {
  const needed = bitsNeeded(number);
  return Math.pow(2, needed) === number ? needed : needed - 1;
}

export function getSecureRandomInt(options: number, random: RandomSource) {
  const bits = bitsNeeded(options);
  return random.getBits(bits) % options;
}

export function getSecureRandomBigInt(options: bigint, random: RandomSource) {
  const bits = bitsNeeded(options);
  return random.getBigBits(bits) % options;
}

export function getRandomEntry<T>(array: T[], random: RandomSource): T {
  return array[getSecureRandomInt(array.length, random)];
}

export class RandomWeighted<T extends { weight: number }> {
  total: bigint;
  entropyNeeded: number;
  entropyProvided: number;
  sections: Array<{ group: T; max: number }>;

  constructor(groups: T[]) {
    this.total = groups.reduce(
      (total, { weight }) => total + BigInt(weight),
      BigInt(0),
    );
    let max = 0;
    this.sections = groups.map((group) => {
      max += group.weight;
      return {
        group,
        max,
      };
    });
    this.entropyNeeded = bitsNeeded(this.total);
    this.entropyProvided = bitsProvided(this.total);
  }
  getRandom(random: RandomSource): T {
    const i = getSecureRandomBigInt(this.total, random);
    for (const { group, max } of this.sections) {
      if (i < max) {
        return group;
      }
    }
    return this.sections[0].group;
  }
}

export interface PasswordGenerator {
  humanName: string;
  targetLength: number;
  entropyNeeded: number;
  entropyProvided: number;
  getRandom(random: RandomSource): string;
}

export class RandomWords implements PasswordGenerator {
  weighted: RandomWeighted<{ listOfWords: string[][]; weight: number }>;
  entropyNeeded: number = -1; // TODO
  entropyProvided: number = -1; // TODO

  constructor(
    public humanName: string,
    public targetLength: number,
    public words: string[][][],
  ) {
    let maxNeeded = 0;
    this.weighted = new RandomWeighted(
      this.words.map((listOfWords) => {
        maxNeeded = Math.max(
          maxNeeded,
          listOfWords.reduce(
            (total, words) => total + bitsNeeded(words.length),
            0,
          ),
        );
        return {
          listOfWords,
          weight: listOfWords.reduce((total, words) => total * words.length, 1),
        };
      }),
    );
    this.entropyNeeded = this.weighted.entropyNeeded + maxNeeded;
    this.entropyProvided = this.weighted.entropyProvided;
  }

  getRandom(random: RandomSource): string {
    return this.weighted
      .getRandom(random)
      .listOfWords.map((words) => getRandomEntry(words, random))
      .join("-");
  }
}
