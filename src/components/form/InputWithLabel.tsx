import clsx from "clsx";
import { useId, type InputHTMLAttributes } from "react";

export type InputWithLabelProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "label" | "children"
> & {
  label: string;
};
export function InputWithLabel({
  label,
  className,
  id,
  ...rest
}: InputWithLabelProps) {
  const elemId = useId();
  return (
    <span id={id} className={clsx("form--element", "form--input", className)}>
      <label htmlFor={elemId}>{label}</label>
      <input id={elemId} {...rest} />
    </span>
  );
}
