import fs from "node:fs";

function* split(parent, base, minSize, absMaxSize) {
  let maxSize = Math.min(absMaxSize, base);
  if (maxSize === base) {
    yield [maxSize];
  }
  if (minSize === base) {
    yield [minSize];
  }
  if (maxSize > base - minSize - 1) {
    maxSize = base - minSize - 1;
    if (maxSize < 0) {
      return;
    }
  }
  while (maxSize >= minSize) {
    const base2 = base - maxSize - 1;
    for (const parts of split(
      [...parent, maxSize],
      base2,
      minSize,
      absMaxSize,
    )) {
      yield [maxSize, ...parts];
    }
    maxSize -= 1;
  }
}

const result = [];
for (const combo of split([], 38, 3, 8)) {
  if (combo.length <= 8) {
    result.push(combo.map((count) => count - 3)); //.reduce((total, num) => total + num, 0) + (combo.length - 1))
  }
}
fs.writeFileSync(
  "./src/utils/permutations.json",
  JSON.stringify(result, null, 2),
);
