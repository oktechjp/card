import { useStore } from "@nanostores/react";
import { hashStore, setHash } from "@/store/hash";
import { docs, type DocStore } from "@/store/doc";
import { getPossibleDocKey } from "@/utils/safeDoc";
import { atom } from "nanostores";

const nullStore = atom<DocStore<any>>({
  state: "no-doc",
  docKey: "",
  validId: false,
});

export function useHashDoc() {
  const hash = useStore(hashStore);
  const docKey = getPossibleDocKey(hash);
  const doc = useStore(docKey ? docs(docKey) : nullStore);
  if (doc.validId && doc.docKey !== hash) {
    setHash(doc.docKey);
  }
  return doc;
}
