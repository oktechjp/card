import encodeQR from "qr";
import { useAsyncMemo, type AsyncMemoState } from "@/hooks/useAsyncMemo";
import { svgToDataURI } from "@/utils/print";

export function useQRCode(
  link: string | null | undefined,
): AsyncMemoState<string | null> {
  return useAsyncMemo(async () => {
    if (!link) {
      return null;
    }
    const data = await encodeQR(link, "svg");
    return svgToDataURI(data);
  }, [link]);
}
