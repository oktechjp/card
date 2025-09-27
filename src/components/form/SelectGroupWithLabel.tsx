import type { OptionGroup } from "@/components/form/OptionGroup";
import { SelectGroupOption } from "@/components/form/SelecGroupOption";
import { SelectWithLabel } from "@/components/form/SelectWithLabel";

export interface CountrySelectProps {
  name: string;
  label: string;
  groups: OptionGroup[];
}
export function SelectGroupWithLabel({
  name,
  label,
  groups,
}: CountrySelectProps) {
  return (
    <SelectWithLabel name={name} defaultValue="" label={label}>
      <option value="">-</option>
      {groups.map((group) => (
        <SelectGroupOption key={group.name} group={group} />
      ))}
    </SelectWithLabel>
  );
}
