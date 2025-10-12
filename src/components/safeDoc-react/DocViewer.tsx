import { createElement, type ReactNode } from "react";
import { HashInput } from "@/components/form/HashInput";
import { isReadyState } from "@/store/safeDoc-store";
import type { SafeDocReact } from ".";

export interface DocViewerProps {
  docKey?: string;
  page?: string;
  showMargins?: boolean;
  allowDraft: boolean;
  setup: SafeDocReact;
  children?: ReactNode
}

export function DocViewer({
  setup,
  docKey,
  page,
  showMargins,
  allowDraft,
  children,
}: DocViewerProps) {
  const docState = setup.useHashDoc(docKey);
  const ready = isReadyState(docState) ? docState : null;
  const doc = ready
    ? allowDraft
      ? (ready.draft ?? ready.doc)
      : ready.doc
    : null;
  const hasDraft = !!ready?.draft;
  if (!ready || !doc) {
    return (
      <>
        {hasDraft && docState.docKey ? (
          <div className="sd--notice">
            <div className="sd--draft-notice">
              There is a draft available!{" "}
              <a href={setup.previewUrl(docState.docKey)}>Show the Preview</a>{" "}
              or <a href={setup.editUrl(docState.docKey)}>continue editing</a>.
            </div>
          </div>
        ) : null}
        <HashInput
          label={
            ready
              ? hasDraft
                ? "Enter a different password"
                : "Document not found. Maybe you mistook?"
              : `Enter the password`
          }
        />
        {docState.state === "pending" ? <>Loading...</> : null}
        {children ? <div className="sd--intro">{children}</div> : null}
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
  const isDraft = doc === ready.draft;
  const hasPublished = !!ready.doc;
  return (
    <>
      {isDraft || hasDraft ? (
        <div className="sd--notice">
          {isDraft ? (
            <>
              <div className="sd--draft">Draft</div>
              {hasPublished ? (
                <div className="sd--draft-diverges">
                  This draft is different from the published{" "}
                  {doc.type.humanName}!{" "}
                  <a href={setup.previewUrl(doc.docKey)}>
                    Show the published {doc.type.humanName}
                  </a>{" "}
                  or <a href={setup.editUrl(doc.docKey)}>continue editing</a>.
                </div>
              ) : (
                <div className="sd--draft-fresh">
                  This draft has not been published.{" "}
                  <a href={setup.editUrl(doc.docKey)}>continue editing</a>
                </div>
              )}
            </>
          ) : (
            <div className="sd--draft-available">
              This is the published version!{" "}
              <a href={setup.previewUrl(doc.docKey)}>Show the edited Draft!</a>
            </div>
          )}
        </div>
      ) : null}
      {ready.type
        .getPages(doc.data)
        .filter((p) => (page ? p.id === page : true))
        .map((page) =>
          createElement(View, {
            isDraft,
            key: page.id,
            page: page.id,
            showMargins: showMargins ?? false,
            ...doc,
          }),
        )}
    </>
  );
}
