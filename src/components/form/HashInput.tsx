import { useId, type ChangeEvent, type FormEvent } from "react";
import { useHash } from "@/hooks/useHash";
import clsx from "clsx";
import { InputWithLabel } from "./InputWithLabel";

export interface HashInputProps {
  label: string;
}
export function HashInput({ label }: HashInputProps) {
  const [hash, setHash] = useHash();
  const onchange = ({
    currentTarget: { value },
  }: FormEvent<HTMLFormElement> | ChangeEvent<HTMLInputElement>) => {
    if (typeof value !== "string") {
      return;
    }
    setHash(value);
  };
  return (
    <form
      className={clsx("form-hash")}
      onSubmit={(e) => {
        e.preventDefault();
        onchange(e);
      }}
    >
      <InputWithLabel
        label={label}
        className={clsx("form-hash")}
        name="code"
        type="text"
        value={hash}
        onChange={onchange}
        width={50}
        autoFocus
      />
    </form>
  );
}
