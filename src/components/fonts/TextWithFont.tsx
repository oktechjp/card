import { clsx } from "clsx";
import type { SVGTextElementAttributes } from "react";
import { isArabic } from "../utils/isArabic";

export type TextWithFontProps = Omit<
  SVGTextElementAttributes<SVGTextElement>,
  "children"
> & {
  children: string | undefined;
};
export function TextWithFont({
  children: text,
  className,
  ...rest
}: TextWithFontProps) {
  return (
    <text
      className={clsx(className, {
        arabic: isArabic(text),
      })}
      {...rest}
    >
      {text}
    </text>
  );
}
