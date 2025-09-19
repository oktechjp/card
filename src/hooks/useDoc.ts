import { fetchDocument, isPossibleDocKey } from "@/utils/safeDoc"
import { useAsyncMemo } from "@/hooks/useAsyncMemo"

export function useDoc (possiblePrivateKey: string) {
    return useAsyncMemo(async () => {
        if (!isPossibleDocKey(possiblePrivateKey)) {
            return
        }
        return await fetchDocument(possiblePrivateKey)
    }, [possiblePrivateKey])
}
