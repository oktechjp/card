import type { OptionGroup } from "@/components/form/OptionGroup";
import { SelectGroupOption } from "@/components/form/SelecGroupOption";
import { SelectWithLabel } from "@/components/form/SelectWithLabel";
import type { ReactNode } from "react";

export interface CountrySelectProps {
  name: string;
  label: string;
  groups: OptionGroup[];
  children?: ReactNode;
  defaultValue?: string;
}
export function SelectGroupWithLabel({
  name,
  label,
  groups,
  children,
  defaultValue,
}: CountrySelectProps) {
  return (
    <>
      <SelectWithLabel
        name={name}
        defaultValue={defaultValue ?? ""}
        label={label}
      >
        {defaultValue ? null : <option value="">-</option>}
        {groups.map((group) => (
          <SelectGroupOption key={group.name} group={group} />
        ))}
      </SelectWithLabel>
      {children ? (
        <span className={"form--element-desc"}>{children}</span>
      ) : null}
    </>
  );
}
