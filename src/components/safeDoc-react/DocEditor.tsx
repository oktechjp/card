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
    return <>No draft or published version for this key available.</>;
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
  const deleteCard = () => {
    discard(`Delete Draft ${docState.docKey}`);
  };
  const link = docState.type.getLink(docState.docKey);
  const TypeForm = setup.forms.get(type)!;
  const TypeView = setup.views.get(type)!;
  const pages = activeDoc.type.getPages(activeDoc.data);
  const discardBtn = (
    <button key="discard" onClickCapture={discardChanges}>
      Discard
    </button>
  );
  const deleteBtn = (
    <button key="delete" onClickCapture={deleteCard}>
      Delete
    </button>
  );

  const publishedBtn = (
    <a key="published" href={link}>
      Published version
    </a>
  );
  const publishBtn = (
    <setup.PublishButton key="publish-doc" doc={docState.draft!}>
      Publish
    </setup.PublishButton>
  )
  const previewBtn = (
    <a key="preview" href={setup.previewUrl(docState.docKey)}>
      Preview
    </a>
  )
  const { title, links } = docState.doc
    ? docState.draft
      ? {
          title: "Diverged from server",
          links: [
            previewBtn,
            publishedBtn,
            <setup.PublishButton doc={docState.draft!} republish>
              Publish new version
            </setup.PublishButton>,
            discardBtn,
          ],
        }
      : {
          title: "Published on server",
          links: [publishedBtn],
        }
    : docState.draft && docState.draft.type.isEmpty(docState.draft.data)
      ? {
          title: "Card Empty",
          links: [
            publishBtn,
            deleteBtn
          ],
        }
      : {
          title: "Not Published",
          links: [
            previewBtn,
            publishBtn,
            deleteBtn,
          ],
        };
  links.push(
    <a key="print" href={setup.printUrl(docState.docKey)}>
      Print
    </a>,
  );
  return (
    <div className="sd--editor">
      <nav className="sd--editor--nav">
        <h2>{title}</h2>
        <ul className="sd--editor--nav-list">
          {links.map((entry) => (
            <li key={entry.key}>{entry}</li>
          ))}
        </ul>
      </nav>
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
    </div>
  );
};
