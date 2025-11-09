#!/usr/bin/env node --permission --allow-fs-write=src/docs/card/* --allow-fs-read=public/svg/*
import { readFile, readdir, writeFile } from "node:fs/promises";

const root = new URL("..", import.meta.url);
const dir = new URL("public/svg/", root);
const target = new URL("src/docs/card/icon-ratios.ts", root);
const files = await readdir(dir);
let res = `import type { AllIconTypes } from "./icons";

/**
 * List of size ratios for all icons in the /public/svg folder.
 * 
 * Generated using -> npm run import:icon-ratios
 */
export const ICON_RATIOS = {
`;
for (const file of files) {
  if (!file.endsWith(".svg")) {
    continue;
  }
  const data = await readFile(new URL(file, dir), "utf-8");
  const matchW = /width=\"(\d+)\"/.exec(data);
  const matchH = /height=\"(\d+)\"/.exec(data);
  res += `  '${file.substring(0, file.length - 4)}': ${parseInt(matchW[1]) / parseInt(matchH[1])},\n`;
}
res += `
} as const satisfies Record<keyof typeof AllIconTypes, number>;
`;
await writeFile(target, res);
console.log(`Wrote ${target.pathname}`);
