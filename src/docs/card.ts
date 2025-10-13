import z from "zod/v4";
import type { DocTypeDefinition } from "@/utils/codecs/doc-codec";
import { ColorEnum } from "@/docs/card/colors";
import { AllIconTypes } from "@/docs/card/icons";
export { ColorEnum } from "@/docs/card/colors";
export { AllIconTypes, CountryGroups } from "@/docs/card/icons";

export const DEFAULT_COLOR = ColorEnum.red;

const schema = z.object({
  surname: z.string().optional(),
  surname_kana: z.string().optional(),
  firstname: z.string().optional(),
  firstname_kana: z.string().optional(),
  callname: z.string().optional(),
  callname_kana: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  url: z.string().optional(),
  email: z.string().optional(),
  color: z.enum(ColorEnum).default(ColorEnum.red),
  bottom1: z.enum(Object.keys(AllIconTypes)).optional(),
  bottom2: z.enum(Object.keys(AllIconTypes)).optional(),
  bottom3: z.enum(Object.keys(AllIconTypes)).optional(),
  bottom4: z.enum(Object.keys(AllIconTypes)).optional(),
  bottom5: z.enum(Object.keys(AllIconTypes)).optional(),
});

export const PAGE_FRONT = { id: "front", label: "Front" } as const;
export const PAGE_BACK = { id: "back", label: "Back" } as const;

export const CardV1 = {
  humanName: "Business Card",
  type: "card",
  version: 1,
  getPages: () => [PAGE_FRONT, PAGE_BACK] as const,
  createStorageRequest: (storageKey) =>
    new Request(`https://public.oktech.jp/docs/${storageKey}.json`),
  getLink: (docKey) => `https://card.oktech.jp#${docKey}`,
  schema,
  isEmpty(doc) {
    const keys = Object.keys(doc);
    return keys.length === 0 || (keys.length === 1 && keys[0] === "color");
  },
} satisfies DocTypeDefinition;

export type CardV1Type = typeof CardV1;
