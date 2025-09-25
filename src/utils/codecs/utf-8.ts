import type { Codec } from "@/utils/codecs/codec";

export const utf8 = {
    encode: (input: string) => new TextEncoder().encode(input),
    decode: (input?: Uint8Array) => new TextDecoder().decode(input),
} as const satisfies Codec<string, Uint8Array<ArrayBuffer>>;
