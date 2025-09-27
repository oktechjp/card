import type { DocTypeDefinition } from "@/utils/safeDoc";
import type { ReactElement } from "react";
import type { output } from "zod/v4";
export interface DocFormProps<
  Type extends DocTypeDefinition = DocTypeDefinition,
> {
  docKey: string;
  type: Type;
  time: Date;
  data: output<Type["schema"]>;
}
export type DocForm<Type extends DocTypeDefinition = DocTypeDefinition> = (
  props: DocFormProps<Type>,
) => ReactElement;
