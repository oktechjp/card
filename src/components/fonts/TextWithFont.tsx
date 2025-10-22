import { clsx } from "clsx";
import type { SVGTextElementAttributes } from "react";

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
        arabic: text ? /[\u0600-\u06FF\u0750-\u077F]/.test(text) : false,
      })}
      {...rest}
    >
      {text}
    </text>
  );
}
