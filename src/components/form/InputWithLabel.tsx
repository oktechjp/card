import clsx from "clsx";
import { useId, type InputHTMLAttributes, type ReactNode } from "react";

export type InputWithLabelProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "label" | "children"
> & {
  label: string;
  children?: ReactNode;
};
export function InputWithLabel({
  label,
  className,
  id,
  children,
  ...rest
}: InputWithLabelProps) {
  const elemId = useId();
  return (
    <>
      <span id={id} className={clsx("form--element", "form--input", className)}>
        <label htmlFor={elemId}>{label}</label>
        <input id={elemId} {...rest} />
      </span>
      {children ? (
        <span className={clsx("form--element-desc", className)}>
          {children}
        </span>
      ) : null}
    </>
  );
}
