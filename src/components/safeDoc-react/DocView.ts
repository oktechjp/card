import type { DocTypeDefinition } from "@/utils/safeDoc";
import type { ReactElement, Ref } from "react";
import type { output } from "zod/v4";

type ArrayType<T extends any[]> = T extends Array<infer T> ? T : never;

export interface DocViewProps<
  Type extends DocTypeDefinition = DocTypeDefinition,
> {
  ref?: Ref<SVGSVGElement>;
  docKey: string;
  type: Type;
  time: Date;
  data: output<Type["schema"]>;
  isDraft: boolean;
  showMargins: boolean;
  page: ArrayType<ReturnType<Type["getPages"]>>["id"];
}
export type DocView<Type extends DocTypeDefinition = DocTypeDefinition> = (
  props: DocViewProps<Type>,
) => ReactElement;

export type DocPageViewProps<Type extends DocTypeDefinition> = Omit<
  DocViewProps<Type>,
  "page"
>;
export type DocPageView<Type extends DocTypeDefinition> = (
  props: DocPageViewProps<Type>,
) => ReactElement;
