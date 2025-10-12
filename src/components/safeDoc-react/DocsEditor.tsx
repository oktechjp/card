import { getPossibleDocKey, type DocTypeDefinition } from "@/utils/safeDoc";
import { DocEditor } from "@/components/safeDoc-react/DocEditor";
import { useStore } from "@nanostores/react";
import { knownDraftIds, createDoc } from "@/store/safeDoc-store";
import { hashStore, setHash } from "@/store/hash";
import { useRef } from "react";
import { NewDocDialog } from "@/components/safeDoc-react/NewDocDialog";
import type { SafeDocReact } from ".";
import { SelectWithLabel } from "../form/SelectWithLabel";

export interface DocsEditorProps {
  setup: SafeDocReact;
}
export function DocsEditor({ setup }: DocsEditorProps) {
  const newDocDialog = useRef<HTMLDialogElement>(null);
  const hash = useStore(hashStore);
  const knownIds = useStore(knownDraftIds);
  const onNewDoc = (type: DocTypeDefinition, privateKey: string) => {
    setHash(createDoc(type, privateKey));
  };
  const isPossibleDocKey = getPossibleDocKey(hash) != null;
  return (
    <>
      <div className="sd--editors-menu">
        <SelectWithLabel
          label="Selected"
          className="sd--editors-select"
          defaultValue={hash}
          onChange={(event) => {
            if (event.currentTarget.value === "new") {
              newDocDialog.current?.showModal();
              event.preventDefault();
              event.stopPropagation();
              event.currentTarget.value = hash;
              return;
            }
            setHash(event.currentTarget.value);
          }}
        >
          <option value="">-</option>
          <option value="new">New</option>
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
        </SelectWithLabel>
        <setup.EditorMenu docKey={hash} />
      </div>
      <NewDocDialog
        ref={newDocDialog}
        types={setup.types}
        onSuccess={onNewDoc}
      />
      {hash && isPossibleDocKey ? (
        <DocEditor key={hash} docKey={hash} setup={setup} />
      ) : null}
    </>
  );
}
