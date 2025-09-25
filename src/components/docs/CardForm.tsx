import { ColorType, CountryGroups, DEFAULT_COLOR } from "@/docs/card";
import { InputWithLabel } from "./InputWithLabel";
import { SelectWithLabel } from "./SelectWithLabel";
import { SelectGroupWithLabel } from "./SelectGroupWithLabel";
import type { OptionGroup } from "./OptionGroup";

export function CardForm() {
    return <>
        <InputWithLabel name="surname" label="Surname" />
        <InputWithLabel name="surname_kana" label="Surname Kana" />
        <InputWithLabel name="firstname" label="Firstname" />
        <InputWithLabel name="firstname_kana" label="Firstname Kana" />
        <InputWithLabel name="callname" label="Callname" />
        <InputWithLabel name="callname_kana" label="Callname Kana" />
        <InputWithLabel name="subtitle" label="Subtitle" />
        <InputWithLabel name="email" label="Email" />
        <InputWithLabel name="url" label="URL" />
        <SelectWithLabel
          name="color"
          label="Color"
          defaultValue={DEFAULT_COLOR}
        >
          {Object.entries(ColorType).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </SelectWithLabel>
        <InputWithLabel name="description" label="Description" />
        <SelectGroupWithLabel groups={CountryGroups as OptionGroup[]} name="bottom1" label="Icon A" />
        <SelectGroupWithLabel groups={CountryGroups as OptionGroup[]} name="bottom2" label="Icon B" />
    </>
}