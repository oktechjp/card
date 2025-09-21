import { useState } from "react";

export function useToggle(
  defaultValue: boolean = false,
): [value: boolean, toggleValue: (override?: any) => void] {
  const [value, setValue] = useState(defaultValue);
  const toggleCut = (override: any) => {
    setValue((current) => {
      if (override === true || override === false) return override;
      return !current;
    });
  };
  return [value, toggleCut];
}
