import type { CardV1 } from "@/docs/card";
import type { DocView, DocViewProps } from "@/components/safeDoc-react/DocView";
import { CardDisplayFront } from "@/components/docs/card/CardDisplayFront";
import { CardDisplayBack } from "@/components/docs/card/CardDisplayBack";

export type CardViewProps = DocViewProps<typeof CardV1>;

export const CardView: DocView<typeof CardV1> = ({
  page,
  ...props
}: CardViewProps) => {
  if (page === "front") return <CardDisplayFront {...props} />;
  if (page === "back") return <CardDisplayBack {...props} />;

  throw new Error(`Unexpected page requested ${page}`);
};
