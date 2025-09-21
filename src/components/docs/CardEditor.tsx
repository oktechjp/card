import { isPossibleDocKey } from "@/utils/safeDoc";
import { CardForm } from "@/components/docs/CardForm";
import { useStore } from "@nanostores/react";
import { knownDraftIds, createDoc } from "@/store/doc";
import { hashStore, setHash } from "@/store/hash";

export function CardEditor() {
  const hash = useStore(hashStore);
  const knownIds = useStore(knownDraftIds);
  const newCard = () => {
    setHash(createDoc());
  };
  return (
    <>
      <select
        value={hash}
        onChange={(elem) => setHash(elem.currentTarget.value)}
      >
        <option value="">-</option>
        {isPossibleDocKey(hash) && !knownIds.includes(hash) ? (
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
      <button onClick={newCard}>New Card</button>
      {hash && isPossibleDocKey(hash) ? <CardForm docKey={hash} /> : null}
    </>
  );
}
