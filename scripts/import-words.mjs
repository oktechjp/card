#!/usr/bin/env node --permission --allow-fs-write=src/utils/password-dict-*.ts --allow-fs-read=dict-*.txt
import { readFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { Buffer } from "node:buffer";
import { Readable } from "node:stream";

const BASE = new URL("..", import.meta.url);

for (const wordSet of [
  {
    humanName: "Words",
    dictFile: "dict-words.txt",
    outFile: "src/utils/password-dict-words.ts",
    constName: "passwordWords",
    targetLength: 37,
  },
]) {
  const { humanName, dictFile, targetLength, outFile, constName } = wordSet;
  const wordlist = (await readFile(new URL(dictFile, BASE), "utf-8"))
    .split("\n")
    .sort((a, b) =>
      a.length > b.length
        ? 1
        : a.length < b.length
          ? -1
          : a > b
            ? 1
            : a < b
              ? -1
              : 0,
    );
  const words = [];
  let bucketLen = 0;
  let bucket = [];
  for (const word of wordlist) {
    if (bucketLen < word.length) {
      bucket = [];
      bucketLen = word.length;
      words.push(bucket);
    }
    bucket.push(word);
  }

  let shortest = Number.MAX_VALUE;
  const lengths = [];
  const counts = {};
  for (const byChars of words) {
    const word = byChars[0];
    console.log(`len=${word.length}: ${byChars.length}`);
    if (word.length < shortest) {
      shortest = word.length;
    }
    lengths.unshift(word.length);
    counts[word.length] = BigInt(byChars.length);
  }

  function* permutate(current = [], length = 0) {
    for (const len of lengths) {
      const nextLen = length === 0 ? len : length + 1 + len;
      if (nextLen > targetLength) {
        continue;
      }
      const next = [...current, len];
      if (nextLen === targetLength) {
        yield next;
        continue;
      }
      for (const found of permutate(next, nextLen)) {
        yield found;
      }
    }
  }

  const createWriteSession = () => ({
    buf: null,
    written: 0,
    first: true,
    write(uint8) {
      if (!this.buf) {
        this.buf = Buffer.alloc(1000);
        this.written = 0;
      }
      this.buf[this.written++] = uint8;
      return this.written === this.buf.length;
    },
    flush() {
      let buf = this.buf;
      if (this.written < buf.length) {
        buf = buf.slice(0, this.written);
      }
      this.buf = null;
      this.written = 0;
      const res = (this.first ? "" : ",\n") + `"${buf.toString("base64")}"`;
      this.first = false;
      return res;
    },
  });

  Readable.from(
    (function* () {
      yield ` 
  /**
   * Generated from "${outFile}" using → npm run import:words
   **/
  import { RandomWords } from "@/utils/crypto";
  import { base64 } from "@/utils/codecs/base64";
  import { utf8 } from "@/utils/codecs/utf-8";

  const words: string[][] = (() => {
    const buffer = base64.decode([
      `;
      const wordsChunks = [];
      for (const bucket of words) {
        for (const word of bucket) {
          const buf = Buffer.from(word, "utf-8");
          const len = Buffer.alloc(1);
          len[0] = buf.length;
          wordsChunks.push(len, buf);
        }
      }
      yield Buffer.concat(wordsChunks)
        .toString("base64")
        .match(/.{1,400}/g)
        .map((str) => `"${str}"`)
        .join(",\n");

      yield `].join(''))
    let len = 0;
    let current: string[] | undefined = undefined
    const result: string[][] = [];
    for (let i = 0; i < buffer.length;) {
      const wordLen = buffer[i]
      const start = i + 1
      const end = start + wordLen
      const word = utf8.decode(buffer.slice(start, end))
      if (word.length > len || current === undefined) {
        current = []
        len = word.length
        result.push(current)
      }
      current!.push(word)
      i = end
    }
    return result
  })();
  export const ${constName} = new RandomWords("${humanName}", ${targetLength}, [
  `;
      const permSession = createWriteSession();
      for (const permutation of permutate()) {
        if (permSession.write(0)) {
          yield permSession.flush();
        }
        for (const len of permutation) {
          if (permSession.write(1 + len - shortest)) {
            yield permSession.flush();
          }
        }
      }
      if (permSession.written) {
        yield permSession.flush();
      }
      yield `
    ]
      .map(base64.decode)
      .reduce((state, chunk) => {
        for (const byte of chunk) {
          if (byte === 0) {
            state.current = []
            state.words.push(state.current)
            continue
          }
          const dict = words[byte-1]
          if (!dict) {
            console.log(byte, words.length)
            throw new Error("unknown dict referenced")
          }
          state.current.push(dict)
        }
        return state
      }, {
        current: [] as string[][],
        words: [] as string[][][], 
      })
      .words
  );
  `;
    })(),
  ).pipe(createWriteStream(new URL(outFile, BASE)));
}
