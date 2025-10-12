import type { CSSProperties, ReactNode, Ref } from "react";
import type { DocTypeDefinition } from "@/utils/safeDoc";
import type { DocViewProps } from "@/components/safeDoc-react";

const rect = (width: number, height: number) => ({ width, height, ratio: height / width, center: { x: width / 2, y: height / 2 } })

const size = (width: number, height: number, padding: number) => {
  const normal = rect(width, height)
  const padded = rect(width + padding * 2, height + padding * 2)
  return {
    normal,
    padding,
    padded,
    viewBox: `${-padding} ${-padding} ${padded.width} ${padded.height}`,
  }
}

export const CARD_SIZE = size(910, 550, 25);

const PADDING_WHEN_CUT: CSSProperties = {
  margin: `-${100 / CARD_SIZE.normal.width * CARD_SIZE.padding}%`
}

export type BusinessCardSvgDisplayProps<Type extends DocTypeDefinition> = Omit<
  DocViewProps<Type>,
  "page"
> & {
  isCut?: boolean;
  ref?: Ref<SVGSVGElement>;
};

export type BusinessCardSvgProps = {
  isCut?: boolean;
  children?: ReactNode;
  background: string;
  ref?: Ref<SVGSVGElement>;
  style?: Omit<CSSProperties, "width" | "height" | "overflow" | "display"> & {
    width: number;
  };
};

export function BusinessCardSvg({
  isCut,
  children,
  background,
  style,
  ref,
}: BusinessCardSvgProps) {
  isCut = isCut ?? true;
  const boxStyle: CSSProperties = {
    width: '100cqw',
    height: `${100 * (isCut ? CARD_SIZE.normal : CARD_SIZE.padded).ratio}cqw`,
    overflow: "hidden",
    display: "inline-block",
    ...style,
  };
  return (
    <div style={boxStyle} className="bc">
      <div style={isCut ? PADDING_WHEN_CUT : undefined}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="business-card"
          ref={ref}
          viewBox={CARD_SIZE.viewBox}
          width={"100%"}
        >
          <rect
            x={-CARD_SIZE.padding}
            y={-CARD_SIZE.padding}
            width={CARD_SIZE.padded.width}
            height={CARD_SIZE.padded.height}
            fill={background}
          />
          {children}
        </svg>
      </div>
    </div>
  );
}
