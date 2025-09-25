import type { ReactElement } from "react";
import type { DocDisplayProps } from "./docs/DocsDisplay";
import { CardDisplay } from "./docs/card/CardDisplay";
import { DOC_TYPE, DOC_VERSION } from "@/docs/card";

export type KnownType = {
  type: string;
  version: number;
  component: (props: DocDisplayProps<any>) => ReactElement;
};
export const KnownTypes = [
  {
    type: DOC_TYPE,
    version: DOC_VERSION,
    component: CardDisplay,
  },
] satisfies Array<KnownType>;
