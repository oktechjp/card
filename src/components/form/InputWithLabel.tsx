import { useId, type InputHTMLAttributes } from "react";

export type InputWithLabelProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "label" | "children"
> & {
  label: string;
};
export function InputWithLabel({
  label,
  style,
  className,
  id,
  ...rest
}: InputWithLabelProps) {
  const elemId = useId();
  return (
    <span id={id} style={style} className={className}>
      <label htmlFor={elemId}>{label}</label>
      <input id={elemId} {...rest} />
    </span>
  );
}
