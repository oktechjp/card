import { useStore } from '@nanostores/react'
import { hashStore, setHash } from "@/store/hash"

export function useHash ():
[hash: string, setHash: (newHash: string) => void] {
    const s = useStore(hashStore)
    return [s, setHash] 
}
