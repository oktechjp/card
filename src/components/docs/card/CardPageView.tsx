import type { CardV1 } from "@/docs/card";
import type {
  DocPageView,
  DocPageViewProps,
} from "@/components/safeDoc-react/DocView";
import { CardDisplayFront } from "@/components/docs/card/CardDisplayFront";
import { CardDisplayBack } from "@/components/docs/card/CardDisplayBack";

export type CardPageViewProps = DocPageViewProps<typeof CardV1>;

export const CardPageView: DocPageView<typeof CardV1> = ({
  page,
  ...props
}: CardPageViewProps) => {
  if (page === "front") return <CardDisplayFront {...props} />;
  if (page === "back") return <CardDisplayBack {...props} />;

  throw new Error(`Unexpected page requested ${page}`);
};
