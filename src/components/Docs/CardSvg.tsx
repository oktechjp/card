import type { ReactNode } from "react";

export const CARD_WIDTH = 910
export const CARD_HEIGHT = 540
export const PADDING = 15


export function CardSvg ({ isCut, children, background }: { isCut: boolean, children?: ReactNode, background: string }) {
    const viewBox = isCut
        ? `0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`
        : `${-PADDING} ${-PADDING} ${CARD_WIDTH + PADDING*2} ${CARD_HEIGHT + PADDING*2}`
    return <svg viewBox={viewBox} width={isCut ? CARD_WIDTH / 2 : (CARD_WIDTH + PADDING*2)/2} style={{ border: '1px solid black' }}>
        <rect x={-15} y={-15} width="940" height="580" fill={background} />
        {children}
    </svg>
}
