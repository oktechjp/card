import hepburn from "hepburn";
import fs from "node:fs";
const wordsFile = "./src/utils/words.json";
// const jp = fs.readFileSync("./jp.txt", "utf-8").split('\n').map(chars => chars.split(' ')[0]).filter(word => ! /ー/.test(word))
// const words = JSON.parse(fs.readFileSync(wordsFile, 'utf-8')).concat(jp.map(hira =>
//     hepburn
//         .fromKana(hira)
//         .toLowerCase()
//         .replaceAll('ぁ', 'a')
//         .replaceAll('ぃ', 'i')
//         .replaceAll('ぇ', 'e')
//         .replaceAll('ぉ', 'o')
//         .replaceAll('ō', 'o')
//         .replaceAll('ū', 'u')
//         .replaceAll('ā', 'a')
//         .replaceAll('ī', 'i')
//         .replaceAll('ē', 'e')
//         .replaceAll('ō', 'o')
// ).filter(word =>
//     word.length >= 2 &&
//     word.length <= 6 &&
//     /^[a-z]+$/i.test(word)
// )).sort()
const manyWords = fs.readFileSync("./manywords.txt", "utf-8").split("\n");
const byLength = (len) =>
  manyWords
    .map((word) => word.toLowerCase())
    .filter((word) => word.length == len && /^[a-z]+$/i.test(word))
    .sort();

const words = JSON.parse(fs.readFileSync(wordsFile, "utf-8")).concat([
  byLength(7),
  byLength(8),
  byLength(9),
]);
// const duplicates = {};
// const result = [];
// for (const word of words) {
//   if (duplicates[word]) {
//     continue;
//   }
//   duplicates[word] = true;
//   result.push(word);
// }
fs.writeFileSync(wordsFile, JSON.stringify(words, null, 2));
