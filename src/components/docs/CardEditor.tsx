import { getPossibleDocKey } from "@/utils/safeDoc";
import { DocForm } from "@/components/docs/DocForm";
import { useStore } from "@nanostores/react";
import { knownDraftIds, createDoc } from "@/store/doc";
import { hashStore, setHash } from "@/store/hash";
import { useRef } from "react";
import { NewCardDialog } from "./NewCardDialog";

export function CardEditor() {
  const newCardDialog = useRef<HTMLDialogElement>(null);
  const hash = useStore(hashStore);
  const knownIds = useStore(knownDraftIds);
  const newCard = (privateKey: string) => {
    setHash(createDoc(privateKey));
  };
  const isPossibleDocKey = getPossibleDocKey(hash) != null;
  return (
    <>
      <select
        value={hash}
        onChange={(elem) => setHash(elem.currentTarget.value)}
      >
        <option value="">-</option>
        {isPossibleDocKey && !knownIds.includes(hash) ? (
          <optgroup label="Persisted">
            <option key={hash} value={hash}>
              {hash}
            </option>
          </optgroup>
        ) : null}
        {knownIds.length > 0 ? (
          <optgroup label="Drafts">
            {knownIds.map((privateKey) => (
              <option key={privateKey} value={privateKey}>
                {privateKey}
              </option>
            ))}
          </optgroup>
        ) : null}
      </select>
      <button
        onClick={() => {
          newCardDialog.current!.showModal();
        }}
      >
        New Card
      </button>
      <NewCardDialog ref={newCardDialog} onSuccess={newCard} />
      {hash && isPossibleDocKey ? <DocForm docKey={hash} /> : null}
    </>
  );
}
