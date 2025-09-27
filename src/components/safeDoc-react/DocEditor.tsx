import { useEffect, useRef } from "react";
import { formToJSON, jsonToForm } from "@/utils/form";
import { useAsyncMemo } from "@/hooks/useAsyncMemo";
import { encryptDocument } from "@/utils/safeDoc";
import { setHash } from "@/store/hash";
import type { SafeDocReact } from ".";

export type DocEditorProps = {
  docKey?: string;
  setup: SafeDocReact;
};
export const DocEditor = ({ docKey, setup }: DocEditorProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLTextAreaElement>(null);
  const docState = setup.useDoc(docKey);
  const activeDoc =
    docState.state === "ready" ? (docState.draft ?? docState.doc) : null;
  const encrypted = useAsyncMemo(
    async () =>
      activeDoc ? encryptDocument(setup.codec.encode(activeDoc)) : null,
    [activeDoc],
  );
  useEffect(() => {
    if (!formRef.current) return;
    if (!activeDoc) return;
    jsonToForm(JSON.stringify(activeDoc.data), formRef.current);
  }, [activeDoc]);
  if (docState.state === "no-doc") {
    return <>Not a document.</>;
  }
  if (docState.state === "no-stored") {
    return <>Nothing stored for they key</>;
  }
  if (docState.state !== "ready" || !activeDoc) {
    return <>Loading/..</>;
  }
  const { type } = docState;
  const handleFormChange = () => {
    if (docState.state !== "ready") {
      return;
    }
    docState.saveDraft(type, formToJSON(formRef.current!));
  };
  const discard = (message: string) => {
    if (!confirm(message)) {
      return;
    }
    if (!docState.discard()) {
      setHash("");
    }
  };
  const discardChanges = () => {
    discard(`Discard Changes ${docState.docKey}`);
  };
  const discardCard = () => {
    discard(`Delete Draft ${docState.docKey}`);
  };
  const link = docState.type.getLink(docState.docKey);
  const TypeForm = setup.forms.get(type)!;
  const TypeView = setup.views.get(type)!;
  const pages = activeDoc.type.getPages(activeDoc.data);
  return (
    <>
      <div>
        {docState.doc ? (
          docState.draft ? (
            <>
              Diverged from server <a href={link}>{link}</a>,{" "}
              <setup.UpdateDocButton doc={docState.draft!}>
                Update Storage
              </setup.UpdateDocButton>
              <button onClick={discardChanges}>Discard Changes</button>
            </>
          ) : (
            <a href={link}>{link}</a>
          )
        ) : docState.draft &&
          docState.draft.type.isEmpty(docState.draft.data) ? (
          <>
            Card Empty
            <button onClick={discardChanges}>Discard</button>
          </>
        ) : (
          <>
            Not Stored on server{" "}
            <setup.CreateDocButton doc={docState.draft!}>
              Store
            </setup.CreateDocButton>
            <button onClick={discardCard}>Discard Card</button>
          </>
        )}
      </div>
      <div>
        <a href={setup.printUrl(docState.docKey)}>Print</a>
      </div>
      <div>
        {pages.map((page) => (
          <TypeView
            key={page.id}
            page={page.id}
            showMargins={false}
            {...activeDoc}
            isDraft={!docState.doc}
          />
        ))}
      </div>
      <form ref={formRef} onInput={handleFormChange}>
        <TypeForm {...activeDoc} />
      </form>
      <details>
        <summary>Advanced</summary>
        <div>
          <input
            type="text"
            size={83}
            ref={fileRef}
            disabled
            defaultValue={`${encrypted?.data?.publicKey ?? ""}`}
          />
          <br />
          <textarea
            cols={50}
            rows={15}
            ref={docRef}
            disabled
            defaultValue={
              encrypted?.data?.encrypted
                ? JSON.stringify(encrypted.data.encrypted, null, 2)
                : ""
            }
          />
        </div>
      </details>
    </>
  );
};
