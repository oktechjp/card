import type { OptionGroup } from "@/components/form/OptionGroup";
import type { DocForm } from "@/components/safeDoc-react";
import { InputWithLabel } from "@/components/form/InputWithLabel";
import { SelectWithLabel } from "@/components/form/SelectWithLabel";
import { SelectGroupWithLabel } from "@/components/form/SelectGroupWithLabel";
import { ColorEnum, CountryGroups, DEFAULT_COLOR } from "@/docs/card";
import { ColorInfo } from "@/components/docs/card/ColorInfo";

export const CardForm: DocForm = () => (
  <>
    <InputWithLabel name="surname" label="Surname" />
    <InputWithLabel name="surname_kana" label="Surname Kana" />
    <InputWithLabel name="firstname" label="Firstname" />
    <InputWithLabel name="firstname_kana" label="Firstname Kana" />
    <InputWithLabel name="callname" label="Callname" />
    <InputWithLabel name="callname_kana" label="Callname Kana" />
    <InputWithLabel name="subtitle" label="Subtitle" />
    <InputWithLabel name="email" label="Email" />
    <InputWithLabel name="url" label="URL" />
    <SelectWithLabel name="color" label="Color" defaultValue={DEFAULT_COLOR}>
      {Object.keys(ColorEnum).map((key) => (
        <option key={key} value={key}>
          {ColorInfo[key as keyof typeof ColorInfo].label}
        </option>
      ))}
    </SelectWithLabel>
    <InputWithLabel name="description" label="Description" />
    <SelectGroupWithLabel
      groups={CountryGroups as OptionGroup[]}
      name="bottom1"
      label="Icon A"
    />
    <SelectGroupWithLabel
      groups={CountryGroups as OptionGroup[]}
      name="bottom2"
      label="Icon B"
    />
  </>
);
