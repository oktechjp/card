export interface DocDisplayControl {
  download(page: string): Promise<string>
}
export interface DocDisplayProps<DocType, > {
  json: DocType;
  link: string;
  docKey: string;
}
