import { useStore } from "@nanostores/react"
import { hashStore } from "@/store/hash"
import { docs } from "@/store/doc"

export function useHashDoc() {
    const hash = useStore(hashStore)
    const fromHash = useStore(docs(hash))
    return { hash, fromHash }
}