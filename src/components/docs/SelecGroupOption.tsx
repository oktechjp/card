import type { OptionGroup } from "./OptionGroup";

export interface SelectGroupOptionProps {
  group: OptionGroup;
  parent?: string;
}
export function SelectGroupOption({
  group,
  parent,
}: SelectGroupOptionProps) {
  const name = parent ? `${parent} - ${group.name}` : group.name;
  const options = Object.entries(group.entries ?? {})
    .sort(([_, a], [__, b]) => (a > b ? 1 : b > a ? -1 : 0))
    .map(([value, name]) => {
      return (
        <option key={value} value={value}>
          {name}
        </option>
      );
    });
  return (
    <>
      {options.length > 0 ? (
        <optgroup label={name} key={name}>
          {options}
        </optgroup>
      ) : null}
      {(group.groups ?? []).map((group) => (
        <SelectGroupOption key={group.name} group={group} parent={name} />
      ))}
    </>
  );
}
