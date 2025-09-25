import type { Codec } from "@/utils/codecs/codec";
import { utf8 } from '@/utils/codecs/utf-8';

export const json = {
    encode: (input: any) => utf8.encode(JSON.stringify(input)),
    decode: (input: Uint8Array) => {
        const str = utf8.decode(input);
        try {
            return JSON.parse(str);
        } catch (cause) {
            throw new Error(`Can not parse json:\n${str}`, { cause });
        }
    },
} as const satisfies Codec<any, Uint8Array<ArrayBuffer>>;
