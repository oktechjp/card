import { getPossibleDocKey, type DocTypeDefinition } from "@/utils/safeDoc";
import { DocEditor } from "@/components/safeDoc-react/DocEditor";
import { useStore } from "@nanostores/react";
import { knownDraftIds, createDoc } from "@/store/safeDoc-store";
import { hashStore, setHash } from "@/store/hash";
import { useRef } from "react";
import { NewDocDialog } from "@/components/safeDoc-react/NewDocDialog";
import type { SafeDocReact } from ".";

export interface DocsEditorProps {
  setup: SafeDocReact;
}
export function DocsEditor({ setup }: DocsEditorProps) {
  const newCardDialog = useRef<HTMLDialogElement>(null);
  const hash = useStore(hashStore);
  const knownIds = useStore(knownDraftIds);
  const newCard = (type: DocTypeDefinition, privateKey: string) => {
    setHash(createDoc(type, privateKey));
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
      <NewDocDialog
        ref={newCardDialog}
        types={setup.types}
        onSuccess={newCard}
      />
      {hash && isPossibleDocKey ? (
        <DocEditor key={hash} docKey={hash} setup={setup} />
      ) : null}
    </>
  );
}
