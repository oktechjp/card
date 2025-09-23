import {
  useId,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useHash } from "@/hooks/useHash";
import { sanitizeCrockfordBase32 } from "@/utils/buffer";

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
    setHash(sanitizeCrockfordBase32(value, true));
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
