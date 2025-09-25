import words from "@/utils/words.json" assert { type: "json" };
import permutations from "@/utils/words-permutations.json" assert { type: "json" };
import { getRandomEntry, getSecureRandomInt } from "@/utils/crypto";

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
  }),
);
export const createPrivateKeyWords = () => weighted
    .getRandom()
    .listOfWords.map((words) => getRandomEntry(words))
    .join("-");
