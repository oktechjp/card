import type { CardType } from '@/docs/card'
import type { DocDisplayProps } from '@/components/docs/DocsDisplay'
import { CardDisplayFront } from '@/components/docs/CardDisplayFront'
import { CardDisplayBack } from '@/components/docs/CardDisplayBack'
import { useRef, useState } from 'react'
import { encode } from '@/utils/buffer'
import { useDirHandle, writeFile } from '@/hooks/useDirHandle'
import { useToggle } from '@/hooks/useToggle'


export function CardDisplay({ json, link, docKey }: DocDisplayProps<CardType>) {
    const [isCut, toggleCut] = useToggle(true)
    const front = useRef<SVGSVGElement>(null)
    const back = useRef<SVGSVGElement>(null)
    const { disabled, openDir, error } = useDirHandle(
        async (dir) => {
            if (!front.current || !back.current) {
                throw new Error('not ready')
            }
            const frontSvg = front.current.outerHTML
            const backSvg = back.current.outerHTML
            const name = `bc_${docKey}`
            await writeFile(dir, `${name}_front.svg`, encode(frontSvg))
            await writeFile(dir, `${name}_back.svg`, encode(backSvg))
            alert('Done.')
        }
    )
    return <>
        <div>
            <input type="checkbox" checked={isCut} onClick={toggleCut} />
            <button title={disabled} onClick={openDir} disabled={disabled !== undefined}>Download</button>
        </div>
        {error ? <div className="error">{String(error)}</div>: null}
        <div>
            <CardDisplayFront ref={front} docKey={docKey} json={json} link={link} isCut={isCut} />
            <CardDisplayBack ref={back} docKey={docKey} json={json} link={link} isCut={isCut} />
        </div>
    </>
}
