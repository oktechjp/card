import type { CardType } from '@/docs/card'
import type { DocDisplayProps } from '@/components/docs/DocsDisplay'
import { CardDisplayFront } from '@/components/docs/CardDisplayFront'
import { CardDisplayBack } from '@/components/docs/CardDisplayBack'
import { useEffect, useRef, useState } from 'react'
import { encode } from '@/utils/buffer'

async function writeFile(dir: FileSystemDirectoryHandle, name: string, data: Uint8Array<ArrayBuffer>) {
    const file = await dir.getFileHandle(name, {
        create: true
    })
    const permission = await file.requestPermission({
        mode: 'readwrite'
    })
    if (permission === "denied") {
        throw new Error('You denied the download process :-(')
    }
    if (permission !== "granted") {
        return
    }
    const frontWrite = await file.createWritable({})
    try {
        await frontWrite.write(data)
    } finally {
        await frontWrite.close()
    }
}

export function CardDisplay({ json, link, docKey }: DocDisplayProps<CardType>) {
    const isCut = true
    const front = useRef<SVGSVGElement>(null)
    const back = useRef<SVGSVGElement>(null)
    const [disabled, setDisabled] = useState<string | undefined>("Your browser doesn't support the download API")
    const [error, setError] = useState<Error>()
    useEffect(() => {
        if ('showDirectoryPicker' in globalThis) {
            setDisabled(undefined)
        }
    }, [])
    const download = () => {
        if (!front.current || !back.current) {
            return
        }
        if (disabled) return
        setError(undefined)
        setDisabled('Processing files')
        const frontSvg = front.current.outerHTML
        const backSvg = back.current.outerHTML
        const name = `bc_${docKey}`
        ;(async () => {
            const dir = await globalThis.window.showDirectoryPicker()
            await writeFile(dir, `${name}_front.svg`, encode(frontSvg))
            await writeFile(dir, `${name}_back.svg`, encode(backSvg))
            alert('Done.')
        })()
            .catch(error => {
                if (error.name === 'AbortError') {
                    return
                }
                setError(error)
            })
            .finally(() => {
                setDisabled(undefined)
            })
    }
    return <>
        <div>
            <button title={disabled} onClick={download} disabled={disabled !== undefined}>Download</button>
        </div>
        {error ? <div className="error">{String(error)}</div>: null}
        <div>
            <CardDisplayFront ref={front} docKey={docKey} json={json} link={link} isCut={isCut} />
            <CardDisplayBack ref={back} docKey={docKey} json={json} link={link} isCut={isCut} />
        </div>
    </>
}
