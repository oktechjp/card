import { useEffect, useRef } from "react";
import { formToJSON, jsonToForm } from "@/utils/form";
import { useAsyncMemo } from "@/hooks/useAsyncMemo";
import { encryptDocument } from "@/utils/safeDoc";
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
    return <>No draft or published version for this key available.</>;
  }
  if (docState.state !== "ready" || !activeDoc) {
    return <>Loading...</>;
  }
  const { type } = docState;
  const handleFormChange = () => {
    if (docState.state !== "ready") {
      return;
    }
    docState.saveDraft(type, formToJSON(formRef.current!));
  };
  const TypeForm = setup.forms.get(type)!;
  const TypeView = setup.views.get(type)!;
  const pages = activeDoc.type.getPages(activeDoc.data);
  return (
    <div className="sd--editor">
      <div className="sd--editor-pages">
        {pages.map((page) => (
          <div key={page.id} className="sd--editor-page">
            <TypeView
              page={page.id}
              showMargins={false}
              {...activeDoc}
              isDraft={!docState.doc}
            />
          </div>
        ))}
      </div>
      <article>
        <form
          className="sd--editor--form"
          ref={formRef}
          onInput={handleFormChange}
        >
          <TypeForm {...activeDoc} />
        </form>
        <details className="sd--editor--advanced">
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
      </article>
    </div>
  );
};
