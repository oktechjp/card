import type { CSSProperties, ReactNode, Ref } from "react";
import type { DocTypeDefinition } from "@/utils/safeDoc";
import type { DocViewProps } from "@/components/safeDoc-react";

export const CARD_WIDTH = 910;
export const CARD_HEIGHT = 550;
export const PADDING = 25;

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
  style: styleRaw,
  ref,
}: BusinessCardSvgProps) {
  let { width: styleWidth, ...style } = styleRaw ?? {};
  isCut = isCut ?? true;
  const padding = isCut ? 0 : PADDING * 2;
  const width = CARD_WIDTH + PADDING * 2;
  const height = CARD_HEIGHT + PADDING * 2;
  const docWidth = isCut ? CARD_WIDTH : width;
  const docHeight = isCut ? CARD_HEIGHT : height;
  if (!styleWidth) {
    styleWidth = CARD_WIDTH + padding;
  }
  const styleHeight = (styleWidth / docWidth) * docHeight;
  const stylePadding = (styleWidth / width) * (isCut ? PADDING : 0);
  const viewBox = `${-PADDING} ${-PADDING} ${width} ${height}`;
  const boxStyle: CSSProperties = {
    width: styleWidth,
    height: styleHeight,
    overflow: "hidden",
    display: "inline-block",
    ...style,
  };
  return (
    <div style={boxStyle}>
      <div style={isCut ? { margin: -stylePadding } : {}}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="business-card"
          ref={ref}
          viewBox={viewBox}
          width={styleWidth}
        >
          <rect
            x={-PADDING}
            y={-PADDING}
            width={CARD_WIDTH + PADDING * 2}
            height={CARD_HEIGHT + PADDING * 2}
            fill={background}
          />
          {children}
        </svg>
      </div>
    </div>
  );
}
