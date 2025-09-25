import { ColorEnum } from "@/docs/card";

export type ColorType = {
  label: string
  bg: string
  fg: string
  logo: string
}
const WHITE = "#fff"
const BLACK = "#000"
const LOGO_WHITE = "https://public.oktech.jp/images/logo-and-design/OKTech-logo-white.svg"
const LOGO_BLACK = "https://public.oktech.jp/images/logo-and-design/OKTech-logo-black.svg"

export const ColorInfo = {
  [ColorEnum.red]: {
    label: "Red",
    bg: "#FD4D69",
    fg: WHITE,
    logo: LOGO_WHITE
  },
  [ColorEnum.green]: {
    label: "Green",
    bg: "#49D773",
    fg: WHITE,
    logo: LOGO_WHITE
  },
  [ColorEnum.blue]: {
    label: "Blue",
    bg: "#459BC9",
    fg: WHITE,
    logo: LOGO_WHITE
  },
  [ColorEnum.ocre]: {
    label: "Ocre",
    bg: "#DA9A00",
    fg: WHITE,
    logo: LOGO_WHITE
  },
  torquoise: {
    label: "Torqouise",
    bg: "#00BFBB",
    fg: WHITE,
    logo: LOGO_WHITE
  },
  [ColorEnum.violet]: {
    label: "Violet",
    bg: "#AC77E1",
    fg: WHITE,
    logo: LOGO_WHITE
  },
  [ColorEnum.cyan]: {
    label: "Cyan",
    bg: "#04E9DF",
    fg: BLACK,
    logo: LOGO_BLACK
  },
  [ColorEnum.magenta]: {
    label: "Magenta",
    bg: "#FC1E96",
    fg: BLACK,
    logo: LOGO_BLACK
  },
  [ColorEnum.yellow]: {
    label: "Yellow",
    bg: "#FDD618",
    fg: BLACK,
    logo: LOGO_BLACK
  },
} as const satisfies Record<keyof typeof ColorEnum, ColorType>
