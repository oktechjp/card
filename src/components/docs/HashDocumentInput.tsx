import { useId, type ChangeEventHandler } from "react";
import { useHash } from "@/hooks/useHash";

export const HashDocumentInput = ({ label }: { label: string }) => {
  const [hash, setHash] = useHash();
  const onchange: ChangeEventHandler<HTMLInputElement> = ({
    currentTarget: { value },
  }) => {
    setHash(value);
  };
  const id = useId();
  return (
    <form className="hash-input">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name="code"
        type="text"
        value={hash}
        onChange={onchange}
      ></input>
    </form>
  );
};
