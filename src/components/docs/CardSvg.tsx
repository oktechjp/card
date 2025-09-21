import type { CSSProperties, ReactNode, Ref } from "react";
import type { DocDisplayProps } from "@/components/docs/DocsDisplay";

export const CARD_WIDTH = 910
export const CARD_HEIGHT = 550
export const PADDING = 25

export type CardSvgDocDisplayProps<Type> = DocDisplayProps<Type> & {
    isCut: boolean
    ref?: Ref<SVGSVGElement>
}

export type CardSvgProps = {
    isCut: boolean,
    children?: ReactNode,
    background: string
    ref?: Ref<SVGSVGElement>
}
export function CardSvg ({ isCut, children, background, ref }: CardSvgProps) {
    const width = CARD_WIDTH + PADDING * 2
    const height = CARD_HEIGHT + PADDING * 2
    const viewBox = `${-PADDING} ${-PADDING} ${width} ${height}`
    const boxStyle: CSSProperties = {
        width: isCut ? CARD_WIDTH : width,
        height: isCut ? CARD_HEIGHT : height,
        overflow: "hidden",
        display: "inline-block"
    }
    return <div style={boxStyle}>
        <div style={isCut ? { marginLeft: -PADDING, marginTop: -PADDING } : {}}>
            <svg xmlns="http://www.w3.org/2000/svg" className="business-card" ref={ref} viewBox={viewBox} width={width}>
                <rect x={-PADDING} y={-PADDING} width={CARD_WIDTH + PADDING * 2} height={CARD_HEIGHT + PADDING * 2} fill={background} />
                {children}
            </svg>
        </div>
    </div>
}
