import type { DocTypeDefinition } from "@/utils/safeDoc";
import type { ReactElement, Ref } from "react";
import type { output } from "zod/v4";

type ArrayType<T extends any[]> = T extends Array<infer T> ? T : never;

export interface DocFullViewProps<
  Type extends DocTypeDefinition = DocTypeDefinition,
> {
  ref?: Ref<SVGSVGElement>;
  docKey: string;
  type: Type;
  time: Date;
  data: output<Type["schema"]>;
  isDraft: boolean;
  showMargins: boolean;
  onReady?: () => void;
}
export type DocFullView<Type extends DocTypeDefinition = DocTypeDefinition> = (
  props: DocFullViewProps<Type>,
) => ReactElement;

export interface DocPageViewProps<Type extends DocTypeDefinition>
  extends DocFullViewProps<Type> {
  page: ArrayType<ReturnType<Type["getPages"]>>["id"];
}
export type DocPageView<Type extends DocTypeDefinition> = (
  props: DocPageViewProps<Type>,
) => ReactElement;
