import {
  useId,
  type ChangeEvent,
  type ChangeEventHandler,
  type FormEvent,
} from "react";
import { useHash } from "@/hooks/useHash";
import { c32Lookup } from "@/utils/buffer";

export const HashDocumentInput = ({ label }: { label: string }) => {
  const [hash, setHash] = useHash();
  const onchange = (
    e: FormEvent<HTMLFormElement> | ChangeEvent<HTMLInputElement>,
  ) => {
    const {
      currentTarget: { value },
    } = e;
    console.log(value);
    if (hash.substring(0, value.length) === value) {
      setHash(value);
      return;
    }
    let sane = "";
    for (const char of value) {
      if (c32Lookup[char] !== undefined) {
        sane += char;
        if (sane.length % 6 === 5) {
          sane += "-";
        }
      }
    }
    setHash(sane);
  };
  const id = useId();
  return (
    <form
      className="hash-input"
      onSubmit={(e) => {
        e.preventDefault();
        onchange(e);
      }}
    >
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name="code"
        type="text"
        value={hash}
        onChange={onchange}
        width={50}
      ></input>
    </form>
  );
};
