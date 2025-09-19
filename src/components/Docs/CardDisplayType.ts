import type { CardType } from "@/docs/card"

export type CardDisplayProps ={ json: CardType, link: string }
export type CardDisplayVariantProps = CardDisplayProps & {
    isCut: boolean
}