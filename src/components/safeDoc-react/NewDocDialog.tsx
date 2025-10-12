import type { DocTypeDefinition } from "@/utils/codecs";
import { useEffect, useMemo, useRef, useState, type Ref } from "react";
import { InputWithLabel } from "@/components/form/InputWithLabel";
import { createPrivateKeyBase32 } from "@/utils/private-key-base32";
import { createPrivateKeyWords } from "@/utils/private-key-words";
import { applyRef } from "@/utils/applyRef";
import { SelectWithLabel } from "@/components/form/SelectWithLabel";
import { DocButtonList } from "./DocButtonList";

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
                ?.value;
              return mine === other;
            }) ?? types[0],
          );
        }}
      >
        <h3>
          Create a new{" "}
          {types.length > 1 ? (
            <>
              <SelectWithLabel
                label="document of type"
                name="type"
                className="safeDoc--element--type-selector"
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
            </>
          ) : (
            type.humanName
          )}
        </h3>
        <div>
          <p>
            For privacy, we need to create a <strong>very strong</strong>{" "}
            password for your {type.humanName}.
          </p>
          <p>
            At first, all information will be stored only in your browser. When{" "}
            <strong>you decide to publish</strong> the business card, all data
            on the server will be encrypted using this password!
          </p>
          <p>
            After it is published and <strong>you</strong> share this password
            with other people, it is possible for them to look at your data!
          </p>
          <p>
            We have two shapes for the password,{" "}
            <strong>both are equally safe</strong>! The{" "}
            <em>"Base 32"-variant</em> is a bit shorter but harder to read and
            enter. Choose as you like.
          </p>
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
            label="Password"
            size={40}
            value={privateKey}
          />
          <button
            type="button"
            aria-label="Create a new password"
            onClick={(e) => {
              setLastRefresh(Date.now());
              e.preventDefault();
            }}
          >
            ↻
          </button>
        </div>
        <hr />
        <DocButtonList>
          <button
            type="submit"
            onClick={(e) => {
              onSuccess(type, privateKey);
              setLastRefresh(Date.now());
              ref.current!.close();
              e.preventDefault();
            }}
          >
            Continue
          </button>
          <button
            onClick={(e) => {
              ref.current?.close();
              e.preventDefault();
            }}
          >
            Cancel
          </button>
        </DocButtonList>
      </form>
    </dialog>
  );
}
