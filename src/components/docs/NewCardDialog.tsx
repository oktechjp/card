import { useEffect, useMemo, useRef, useState, type Ref } from "react";
import { InputWithLabel } from "@/components/form/InputWithLabel";
import { createPrivateKeyBase32 } from "@/utils/createPrivateKeyBase32";
import { createPrivateWordsKey } from "@/utils/createPrivateKeyWords";
import { applyRef } from "@/utils/applyRef";

type NewCardDialogProps = {
  ref?: Ref<HTMLDialogElement>;
  onSuccess: (privateKey: string) => void;
};
export const NewCardDialog = ({
  ref: parentRef,
  onSuccess,
}: NewCardDialogProps) => {
  const [type, setType] = useState<"base32" | "words">("base32");
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const privateKeyBase32 = useMemo(createPrivateKeyBase32, [lastRefresh]);
  const privateKeyWords = useMemo(createPrivateWordsKey, [lastRefresh]);
  const privateKey = type === "base32" ? privateKeyBase32 : privateKeyWords;
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    applyRef(parentRef, ref.current);
  }, []);

  return (
    <dialog ref={ref} onAuxClick={() => ref.current?.close()}>
      <h3>Create New Card ({type})</h3>
      <form
        action=""
        onChange={(e) => {
          setType(
            (e.currentTarget.elements["type" as any] as any as RadioNodeList)
              .value as any as "base32" | "words",
          );
        }}
      >
        <InputWithLabel
          type="radio"
          name="type"
          value="base32"
          checked
          label="Base 32"
        />
        <InputWithLabel type="radio" name="type" value="words" label="Words" />
        <InputWithLabel
          type="text"
          name="text"
          disabled
          label="Preview"
          size={40}
          value={privateKey}
        />
        <button
          type="button"
          onClick={(e) => {
            setLastRefresh(Date.now());
            e.preventDefault();
          }}
        >
          NewKey
        </button>
        <button
          type="submit"
          onClick={(e) => {
            onSuccess(privateKey);
            setLastRefresh(Date.now());
            ref.current!.close();
            e.preventDefault();
          }}
        >
          OK
        </button>
        <button
          onClick={(e) => {
            ref.current?.close();
            e.preventDefault();
          }}
        >
          Close
        </button>
      </form>
    </dialog>
  );
};
