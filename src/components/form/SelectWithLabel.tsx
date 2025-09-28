import clsx from "clsx";
import { useId, type SelectHTMLAttributes } from "react";

export type SelectWithLabelProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export function SelectWithLabel({
  label,
  className,
  ...rest
}: SelectWithLabelProps) {
  const id = useId();
  return (
    <span className={clsx("form--element", "form--select", className)}>
      <label htmlFor={id}>{label}</label>
      <select id={id} {...rest} />
    </span>
  );
}
