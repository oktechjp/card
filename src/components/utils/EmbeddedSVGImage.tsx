import { useEffect, useState, type SVGProps } from "react";

export type EmbeddedSVGImageProps = SVGProps<SVGImageElement>
function blobToDataURL(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (!e.target) return
            resolve(e.target.result as string)
        }
        reader.onerror = (e) => {
            console.error(e)
            reject(new Error('error while reading blob'))
        }
        reader.readAsDataURL(blob);
    }) 
}
export function EmbeddedSVGImage ({ href, ...rest }: EmbeddedSVGImageProps) {
    const [datauri, setDataUri] = useState<string>()
    useEffect(() => {
        setDataUri(undefined)
        if (!href) {
            return
        }
        const control = new AbortController()
        ;(async () => {
            const res = await fetch(href, { signal: control.signal })
            const blob = await res.blob()
            setDataUri(await blobToDataURL(blob))
        })().catch(
            error => console.error(error)
        )
        return () => {
            control.abort()
        }
    }, [href])
    if (!datauri) {
        return <></>
    }
    return <image href={datauri} {...rest} />
}