import type { DocFormProps } from "@/components/safeDoc-react/DocForm";
export type { DocForm, DocFormProps } from "@/components/safeDoc-react/DocForm";
import type { DocViewProps } from "@/components/safeDoc-react/DocView";
export type { DocView, DocViewProps } from "@/components/safeDoc-react/DocView";
import type { DocPrintProps } from "@/components/safeDoc-react/DocPrint";
import type { DocViewerProps } from "@/components/safeDoc-react/DocViewer";
import type { DocEditorProps } from "@/components/safeDoc-react/DocEditor";
import type { DocsEditorProps } from "@/components/safeDoc-react/DocsEditor";
import type { DocPrinterProps } from "@/components/safeDoc-react/DocPrinter";
export type { DocState } from "@/store/safeDoc-store";
import { createDocStore, type DocState } from "@/store/safeDoc-store";
import {
  createElement,
  lazy,
  useEffect,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  encryptDocument,
  getPossibleDocKey,
  type DocTypeDefinition,
  type EncryptedDoc,
  createDocCodec,
  type DocCodec,
  type WorkDocument,
} from "@/utils/safeDoc";
import { atom } from "nanostores";
import { useStore } from "@nanostores/react";
import { hashStore, setHash } from "@/store/hash";
import { useAsyncMemo } from "@/hooks/useAsyncMemo";
import type { DocNewProps } from "@/components/safeDoc-react/DocNew";
export {
  DocViewer,
  type DocViewerProps,
} from "@/components/safeDoc-react/DocViewer";
export {
  DocEditor,
  type DocEditorProps,
} from "@/components/safeDoc-react/DocEditor";
export { DocNew, type DocNewProps } from "@/components/safeDoc-react/DocNew";

export interface PublishButtonProps {
  publicKey?: string;
  encrypted?: EncryptedDoc;
  children?: ReactNode;
  republish?: boolean;
}

export interface SafeDocReactType<
  T extends DocTypeDefinition = DocTypeDefinition,
> {
  type: T;
  View: (props: DocViewProps<T>) => ReactElement;
  Form: (props: DocFormProps<T>) => ReactElement;
  Print: (props: DocPrintProps<T>) => ReactElement;
  PublishButton(props: PublishButtonProps): ReactElement;
}

const nullStore = atom<DocState>({
  state: "no-doc",
  docKey: null,
  isValid: false,
});

export interface PublisButtonProps {
  children?: ReactNode;
  republish?: boolean;
  doc: WorkDocument;
}

export type SetupOptions = {
  viewUrl(docKey: string): string;
  previewUrl(docKey: string): string;
  editUrl(docKey: string): string;
  printUrl(docKey: string): string;
  redirect(url: string): void;
};

export function createDocType<T extends DocTypeDefinition = DocTypeDefinition>(
  type: SafeDocReactType<T>,
): SafeDocReactType {
  return type as any as SafeDocReactType;
}

const Viewer = lazy(async () => ({
  default: (await import("@/components/safeDoc-react/DocViewer")).DocViewer,
}));
const Editor = lazy(async () => ({
  default: (await import("@/components/safeDoc-react/DocEditor")).DocEditor,
}));
const Editors = lazy(async () => ({
  default: (await import("@/components/safeDoc-react/DocsEditor")).DocsEditor,
}));
const Printer = lazy(async () => ({
  default: (await import("@/components/safeDoc-react/DocPrinter")).DocPrinter,
}));
const NewDoc = lazy(async () => ({
  default: (await import("@/components/safeDoc-react/DocNew")).DocNew,
}));

function Publish({
  codec,
  lookup,
  doc,
  children,
}: {
  codec: DocCodec;
  lookup: Map<DocTypeDefinition, SafeDocReactType>;
  doc: WorkDocument;
  children?: ReactNode;
}) {
  const react = lookup.get(doc.type);
  const state = useAsyncMemo(
    () => encryptDocument(codec.encode(doc)),
    [doc, codec],
  );
  if (!react) {
    return "Unexpected doctype given.";
  }
  const data = state.state === "success" ? state.data : null;
  return createElement(react.PublishButton, {
    encrypted: data ? data.encrypted : undefined,
    publicKey: data ? data.publicKey : undefined,
    republish: false,
    children,
  });
}

function Republish({
  codec,
  lookup,
  doc,
  children,
}: {
  codec: DocCodec;
  lookup: Map<DocTypeDefinition, SafeDocReactType>;
  doc: WorkDocument;
  children?: ReactNode;
}) {
  const react = lookup.get(doc.type);
  const state = useAsyncMemo(
    () => encryptDocument(codec.encode(doc)),
    [doc, codec],
  );
  if (!react) {
    return "Unexpected doctype given.";
  }
  const data = state.state === "success" ? state.data : null;
  return createElement(react.PublishButton, {
    encrypted: data ? data.encrypted : undefined,
    publicKey: data ? data.publicKey : undefined,
    republish: true,
    children,
  });
}

export function setupSafeDocReact(
  reactTypes: SafeDocReactType[],
  defaultType: DocTypeDefinition,
  options: SetupOptions,
) {
  const types: DocTypeDefinition[] = [];
  const lookup = new Map<DocTypeDefinition, SafeDocReactType>();
  for (const react of reactTypes) {
    if (types.includes(react.type)) {
      throw new Error("Same type needs to be only included once!");
    }
    types.push(react.type);
    lookup.set(react.type, react);
  }
  const store = createDocStore(types, defaultType);
  const codec = createDocCodec(types);
  const useDoc = (input?: string) => {
    const docKey = input ? getPossibleDocKey(input) : null;
    return useStore(docKey ? store(docKey) : nullStore);
  };
  const setup = {
    store,
    types,
    codec,
    PublishButton: ({ doc, children }: PublisButtonProps) =>
      createElement(Publish, { doc, codec, lookup, children }),
    RepublishButton: ({ doc, children }: PublisButtonProps) =>
      createElement(Republish, { doc, codec, lookup, children }),
    views: new Map(reactTypes.map(({ type, View }) => [type, View])),
    forms: new Map(reactTypes.map(({ type, Form }) => [type, Form])),
    prints: new Map(reactTypes.map(({ type, Print }) => [type, Print])),
    Viewer: (props: Omit<DocViewerProps, "setup">) =>
      createElement(Viewer, { setup, ...props }),
    Editor: (props: Omit<DocEditorProps, "setup">) =>
      createElement(Editor, { setup, ...props }),
    Editors: (props: Omit<DocsEditorProps, "setup">) =>
      createElement(Editors, { setup, ...props }),
    Printer: (props: Omit<DocPrinterProps, "setup">) =>
      createElement(Printer, { setup, ...props }),
    NewDoc: (props: Omit<DocNewProps, "setup">) =>
      createElement(NewDoc, { setup, ...props }),
    useDoc,
    useHashDoc(override?: string) {
      const hash = useStore(hashStore);
      const doc = useDoc(override ?? hash);
      useEffect(() => {
        if (doc.isValid && doc.docKey !== hash) {
          setHash(doc.docKey);
        }
      }, [doc.docKey, hash]);
      return doc;
    },
    ...options,
  };
  return setup;
}

export type SafeDocReact = ReturnType<typeof setupSafeDocReact>;
