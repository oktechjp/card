import { useEffect, useState } from "react"

export async function writeFile(dir: FileSystemDirectoryHandle, name: string, data: FileSystemWriteChunkType) {
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

export function useDirHandle(handle: (dir: FileSystemDirectoryHandle) => Promise<void>) {
    const [disabled, setDisabled] = useState<string | undefined>("Your browser doesn't support the download API")
    const [error, setError] = useState<Error>()
    useEffect(() => {
        if ('showDirectoryPicker' in globalThis) {
            setDisabled(undefined)
        }
    }, [])
    const openDir = () => {
        if (disabled) return
        setError(undefined)
        setDisabled('Processing files')
        ;(async () => {
            const dir = await globalThis.window.showDirectoryPicker()
            handle(dir)
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
    return { disabled, openDir, error }
}