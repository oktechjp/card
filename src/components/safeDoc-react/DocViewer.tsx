import { createElement } from "react";
import { HashInput } from "@/components/form/HashInput";
import { isReadyState } from "@/store/safeDoc-store";
import type { SafeDocReact } from ".";

export interface DocViewerProps {
  docKey?: string;
  page?: string;
  showMargins?: boolean;
  setup: SafeDocReact;
}

export function DocViewer({
  setup,
  docKey,
  page,
  showMargins,
}: DocViewerProps) {
  const docState = setup.useHashDoc(docKey);
  const ready = isReadyState(docState) ? docState : null;
  const doc = ready ? ready.doc : null;
  if (!ready || !doc) {
    return (
      <>
        <HashInput
          label={
            ready
              ? "Document not found. Maybe you mistook?"
              : "Please enter the ID from the card."
          }
        />
        {docState.state === "pending" ? <>Loading...</> : null}
      </>
    );
  }
  const View = setup.views.get(doc.type);
  if (!View) {
    return (
      <>
        Error: unknown view type {doc.type.type}#{doc.type.version}
      </>
    );
  }
  return ready.type
    .getPages(doc.data)
    .filter((p) => (page ? p.id === page : false))
    .map((page) =>
      createElement(View, {
        isDraft: false,
        key: page.id,
        page: page.id,
        showMargins: showMargins ?? false,
        ...doc,
      }),
    );
}
