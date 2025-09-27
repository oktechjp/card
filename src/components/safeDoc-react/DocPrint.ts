import type { DocTypeDefinition } from "@/utils/safeDoc";
import type { ReactElement } from "react";
import type { output } from "zod/v4";

export interface DocPrintProps<
  Type extends DocTypeDefinition = DocTypeDefinition,
> {
  docKey: string;
  type: Type;
  time: Date;
  data: output<Type["schema"]>;
}
export type DocPrint<Type extends DocTypeDefinition = DocTypeDefinition> = (
  props: DocPrintProps<Type>,
) => ReactElement;
