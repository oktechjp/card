#!/usr/bin/env node
import { readFile, readdir, writeFile } from 'node:fs/promises'

const dir = new URL('public/svg/', import.meta.url)
const target = new URL('src/docs/svg-sizes.ts', import.meta.url)
const files = await readdir(dir)
let res = `
export const SVG_RATIOS = {
`
for (const file of files) {
    if (!file.endsWith('.svg')) {
        continue
    }
    const data = await readFile(new URL(file, dir), 'utf-8')
    const matchW = /width=\"(\d+)\"/.exec(data)
    const matchH = /height=\"(\d+)\"/.exec(data)
    res += `  '${file.substring(0, file.length - 4)}': ${parseInt(matchW[1])/parseInt(matchH[1])},\n`
}
res += `
} as const
`
await writeFile(target, res)
console.log(`Wrote ${target.pathname}`)
