import z, { type ZodObject, type output } from "zod/v4";
import type { Codec } from "@/utils/codecs/codec";

export type Page = {
  id: string;
  label: string;
};

export type DocTypeDefinition<Schema extends ZodObject = ZodObject> = {
  type: string;
  humanName: string;
  version: number;
  schema: Schema;
  isEmpty(doc: output<Schema>): boolean;
  getLink(docKey: string): string;
  getPages(doc: output<Schema>): Page[];
  createStorageRequest(storageKey: string): Request;
};

export interface WorkDocument<T extends DocTypeDefinition = DocTypeDefinition> {
  type: T;
  docKey: string;
  data: output<T["schema"]>;
  time: Date;
}

export const DecryptedSchema = z.object({
  type: z.string(),
  version: z.int(),
  time: z.iso.datetime(),
  data: z.looseObject({}),
});

export type DecryptedDocument = output<typeof DecryptedSchema>;

export const JSONDocumentSchema = z.object({
  docKey: z.string(),
  doc: DecryptedSchema,
});

export type JSONDocument = {
  docKey: string;
  doc: DecryptedDocument;
};

export type DocCodec = Codec<WorkDocument, JSONDocument> & {
  types: DocTypeDefinition[];
};

export function createDocCodec(types: DocTypeDefinition[]): DocCodec {
  return {
    types,
    decode(input) {
      const { docKey, doc } = JSONDocumentSchema.parse(input);
      const type = types.find(
        (type) => doc.type === type.type && doc.version === type.version,
      );
      if (!type) {
        throw new Error(`Unsupported type ${doc.type}#${doc.version}`);
      }
      return {
        docKey: docKey,
        type,
        time: new Date(doc.time),
        data: type.schema.parse(doc.data),
      };
    },
    encode: (input) => ({
      docKey: input.docKey,
      doc: {
        type: input.type.type,
        version: input.type.version,
        data: input.type.schema.parse(input.data),
        time: input.time.toISOString(),
      },
    }),
  };
}
