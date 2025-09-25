export type OptionGroup = {
  name: string;
  entries?: { [key: string]: string };
  groups?: OptionGroup[];
};
