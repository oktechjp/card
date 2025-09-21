import { useId, type ReactNode } from "react";

export type SelectWithLabelProps = {
  label: string;
  name: string;
  defaultValue?: string;
  children?: ReactNode;
};

export function SelectWithLabel({
  label,
  name,
  defaultValue,
  children,
}: SelectWithLabelProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <select id={id} name={name} defaultValue={defaultValue}>
        {children}
      </select>
    </div>
  );
}
