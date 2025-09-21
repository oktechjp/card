import { useStore } from "@nanostores/react";
import { hashStore } from "@/store/hash";
import { docs } from "@/store/doc";

export function useHashDoc() {
  const docKey = useStore(hashStore);
  return useStore(docs(docKey));
}
