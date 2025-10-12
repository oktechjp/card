import { createElement, type ReactNode } from "react";
import { HashInput } from "@/components/form/HashInput";
import { isReadyState } from "@/store/safeDoc-store";
import type { SafeDocReact } from ".";
import { DocButtonList } from "./DocButtonList";

export interface DocViewerProps {
  docKey?: string;
  page?: string;
  showMargins?: boolean;
  allowDraft: boolean;
  setup: SafeDocReact;
  children?: ReactNode;
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
        <HashInput
          label={
            ready
              ? hasDraft
                ? "Enter a different password"
                : "Document not found. Maybe you mistook?"
              : `Enter the password`
          }
        />
        {docState.state === "pending" ? (
          <>Loading...</>
        ) : hasDraft && docState.docKey ? (
          <div className="sd--notice">
            <div className="sd--draft-notice">
              There is a draft available!{" "}
              <DocButtonList>
                <a href={setup.previewUrl(docState.docKey)} className="button">
                  Show the Preview
                </a>
                <a href={setup.editUrl(docState.docKey)} className="button">
                  continue editing
                </a>
              </DocButtonList>
            </div>
          </div>
        ) : children ? (
          <div className="sd--intro">{children}</div>
        ) : null}
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
                  <DocButtonList>
                    <a href={setup.viewUrl(doc.docKey)} className="button">
                      Show the published {doc.type.humanName}
                    </a>
                    <a href={setup.editUrl(doc.docKey)} className="button">
                      continue editing
                    </a>
                  </DocButtonList>
                </div>
              ) : (
                <div className="sd--draft-fresh">
                  This draft has not been published.
                  <DocButtonList>
                    <a href={setup.editUrl(doc.docKey)} className="button">
                      continue editing
                    </a>
                  </DocButtonList>
                </div>
              )}
            </>
          ) : (
            <div className="sd--draft-available">
              This is the published version!
              <DocButtonList>
                <a href={setup.previewUrl(doc.docKey)} className="button">
                  Show Draft Preview
                </a>
              </DocButtonList>
            </div>
          )}
        </div>
      ) : null}
      <div className="sd--viewer">
        {ready.type
          .getPages(doc.data)
          .filter((p) => (page ? p.id === page : true))
          .map((page) => (
            <div className="sd--viewer-page">
              {createElement(View, {
                isDraft,
                key: page.id,
                page: page.id,
                showMargins: showMargins ?? false,
                ...doc,
              })}
            </div>
          ))}
      </div>
    </>
  );
}
