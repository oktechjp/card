import { useId } from "react";

export type InputWithLabelProps = {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  checked?: boolean;
  value?: string;
  disabled?: boolean;
  size?: number;
};
export function InputWithLabel({
  label,
  name,
  type,
  defaultValue,
  checked,
  value,
  disabled,
  size,
}: InputWithLabelProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        size={size}
        id={id}
        name={name}
        type={type}
        defaultChecked={checked}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
      />
    </div>
  );
}
