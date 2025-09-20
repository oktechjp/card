import type { CSSProperties, ReactNode, Ref } from "react";
import type { DocDisplayProps } from "@/components/docs/DocsDisplay";

export const CARD_WIDTH = 910
export const CARD_HEIGHT = 550
export const PADDING = 15

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
    const padding = isCut ? 0 : PADDING
    const width = CARD_WIDTH + padding * 2
    const height = CARD_HEIGHT + padding * 2
    const viewBox = `${-padding} ${-padding} ${width} ${height}`
    const style: CSSProperties = {
        width: `${width / 100}cm`,
        height: `${height / 100}cm`,
    }
    return <svg xmlns="http://www.w3.org/2000/svg" className="business-card" ref={ref} viewBox={viewBox} width={width / 2} style={style}>
        <rect x={-PADDING} y={-PADDING} width={CARD_WIDTH + PADDING * 2} height={CARD_HEIGHT + PADDING * 2} fill={background} />
        {children}
    </svg>
}
