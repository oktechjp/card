import { useEffect, useRef, useState } from "react"

export function useHash (interval: number = 100):
[hash: string, setHash: (newHash: string) => void] {
    const [hash, setHash] = useState(globalThis.document?.location.hash)
    const ref = useRef({
        hash: '',
        setHash (newHash: string) {
            const doc = globalThis.document
            if (!doc) {
                return
            }
            if (ref.current.hash !== newHash) {
                ref.current.hash = newHash
                doc.location.hash = `#${newHash}`
                setHash(newHash)
            }
        }
    })
    useEffect(() => {
        const doc = globalThis.document
        if (!doc) {
            return
        }
        const int = setInterval(() => {
            let newHash = doc.location.hash
            if (newHash[0] === '#') {
                newHash = newHash.substring(1)
            }
            if (ref.current.hash !== newHash) {
                ref.current.hash = newHash
                setHash(ref.current.hash)
            }
        }, interval)
        return () => clearInterval(int)
    }, [])
    return [hash, ref.current.setHash]
}
