import { useEffect, useMemo, useRef, useState, type Ref } from "react";
import { InputWithLabel } from "@/components/form/InputWithLabel";
import { createPrivateKeyBase32 } from "@/utils/private-key-base32";
import { createPrivateKeyWords } from "@/utils/private-key-words";
import { applyRef } from "@/utils/applyRef";
import type { DocTypeDefinition } from "@/utils/codecs";
import { SelectWithLabel } from "../form/SelectWithLabel";

export interface NewDocDialogProps {
  types: DocTypeDefinition[];
  ref?: Ref<HTMLDialogElement>;
  onSuccess: (type: DocTypeDefinition, privateKey: string) => void;
}
export function NewDocDialog({
  types,
  ref: parentRef,
  onSuccess,
}: NewDocDialogProps) {
  const [idType, setIdType] = useState<"base32" | "words">("base32");
  const [type, setType] = useState<DocTypeDefinition>(types[0]);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const privateKeyBase32 = useMemo(createPrivateKeyBase32, [lastRefresh]);
  const privateKeyWords = useMemo(createPrivateKeyWords, [lastRefresh]);
  const privateKey = idType === "base32" ? privateKeyBase32 : privateKeyWords;
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    applyRef(parentRef, ref.current);
  }, []);

  return (
    <dialog ref={ref} onAuxClick={() => ref.current?.close()}>
      <h3>Create New Card</h3>
      <form
        action=""
        onChange={(e) => {
          const typeForm = e.currentTarget.elements;
          setIdType(
            (typeForm["idType" as any] as any as RadioNodeList).value as any as
              | "base32"
              | "words",
          );
          setType(
            types.find((type) => {
              const other = `${type.type}#${type.version}`;
              const mine = (typeForm["type" as any] as any as RadioNodeList)
                .value;
              console.log({ mine, other });
              return mine === other;
            }) ?? types[0],
          );
        }}
      >
        {types.length > 1 ? (
          <SelectWithLabel
            label="Type"
            name="type"
            defaultValue={`${type.type}#${type.version}`}
          >
            {types.map((type) => {
              const key = `${type.type}#${type.version}`;
              return (
                <option key={key} value={key}>
                  {type.humanName}
                </option>
              );
            })}
          </SelectWithLabel>
        ) : null}
        <div style={{ display: "flex", flexDirection: "row" }}>
          <InputWithLabel
            type="radio"
            name="idType"
            value="base32"
            label="Base 32"
            defaultChecked
          />
          <InputWithLabel
            type="radio"
            name="idType"
            value="words"
            label="Words"
          />
        </div>
        <InputWithLabel
          type="text"
          name="text"
          disabled
          label="Document Key"
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
          ↻
        </button>
        <button
          type="submit"
          onClick={(e) => {
            onSuccess(type, privateKey);
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
          Cancel
        </button>
      </form>
    </dialog>
  );
}
