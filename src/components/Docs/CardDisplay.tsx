import type { CardType } from '@/docs/card'
import { CardDisplayFront } from './CardDisplayFront'
import { CardDisplayBack } from './CardDisplayBack'
import type { CardDisplayProps } from './CardDisplayType'

export function CardDisplay({ json, link }: CardDisplayProps) {
    const isCut = true
    return <>
        <CardDisplayFront json={json} link={link} isCut={isCut} />
        <CardDisplayBack json={json} link={link} isCut={isCut} />
    </>
}