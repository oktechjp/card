import { useId, type ChangeEvent, type FormEvent } from "react";
import { useHash } from "@/hooks/useHash";

export interface DocKeyInputProps {
  label: string;
}
export function DocKeyInput({ label }: DocKeyInputProps) {
  const [hash, setHash] = useHash();
  const onchange = ({
    currentTarget: { value },
  }: FormEvent<HTMLFormElement> | ChangeEvent<HTMLInputElement>) => {
    if (typeof value !== "string") {
      return;
    }
    setHash(value);
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
        autoFocus
      ></input>
    </form>
  );
}
