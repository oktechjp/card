import type { Codec } from "@/utils/codecs/codec";
import { base64 } from "@/utils/codecs/base64";
import { crockfordBase32 } from "@/utils/codecs/crockford-base32";
import { utf8 } from "@/utils/codecs/utf-8";
import { json } from "@/utils/codecs/json";

export const codecs = {
  utf8,
  json,
  base64,
  crockfordBase32,
} as const satisfies { [key: string]: Codec<any, any> };

export { type Codec } from "@/utils/codecs/codec";

export {
  createDocCodec,
  DecryptedSchema,
  JSONDocumentSchema,
  type WorkDocument,
  type DecryptedDocument,
  type JSONDocument,
  type DocCodec,
  type DocTypeDefinition,
  type Page,
} from "@/utils/codecs/doc-codec";
