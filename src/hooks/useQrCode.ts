import encodeQR from "qr"
import { useAsyncMemo, type AsyncMemoState } from "./useAsyncMemo"
import { svgToDataURI } from "@/utils/print"

export function useQRCode (link: string): AsyncMemoState<string> {
    return useAsyncMemo(
        async () => {
            const data = await encodeQR(link, 'svg')
            return svgToDataURI(data)
        },
        [link]
    )
}