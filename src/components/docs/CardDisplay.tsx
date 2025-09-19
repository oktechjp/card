import type { CardType } from '@/docs/card'
import type { DocDisplayProps } from '@/components/docs/DocsDisplay'
import { CardDisplayFront } from '@/components/docs/CardDisplayFront'
import { CardDisplayBack } from '@/components/docs/CardDisplayBack'

export function CardDisplay({ json, link }: DocDisplayProps<CardType>) {
    const isCut = true
    return <>
        <CardDisplayFront json={json} link={link} isCut={isCut} />
        <CardDisplayBack json={json} link={link} isCut={isCut} />
    </>
}
