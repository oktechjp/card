import type { ReactNode, Ref } from "react";
import type { DocDisplayProps } from "@/components/docs/DocsDisplay";

export const CARD_WIDTH = 910
export const CARD_HEIGHT = 540
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
    const viewBox = isCut
        ? `0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`
        : `${-PADDING} ${-PADDING} ${CARD_WIDTH + PADDING*2} ${CARD_HEIGHT + PADDING*2}`
    return <svg xmlns="http://www.w3.org/2000/svg" className="business-card" ref={ref} viewBox={viewBox} width={isCut ? CARD_WIDTH / 2 : (CARD_WIDTH + PADDING*2)/2}>
        <rect x={-PADDING} y={-PADDING} width={CARD_WIDTH + PADDING * 2} height={CARD_HEIGHT + PADDING * 2} fill={background} />
        {children}
    </svg>
}
