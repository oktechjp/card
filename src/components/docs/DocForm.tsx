import { useEffect, useRef } from "react";
import { formToJSON, jsonToForm } from "@/utils/form";
import { CardDisplay } from "@/components/docs/card/CardDisplay";
import { DOC_TYPE, DOC_VERSION, isEmptyCard } from "@/docs/card";
import { useStore } from "@nanostores/react";
import { docs } from "@/store/doc";
import { useAsyncMemo } from "@/hooks/useAsyncMemo";
import { encryptDocument } from "@/utils/safeDoc";
import { setHash } from "@/store/hash";
import { CardForm } from "./card/CardForm";

export type DocFormProps = {
  docKey: string;
};
export const DocForm = ({ docKey }: DocFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLTextAreaElement>(null);
  const doc = useStore(docs(docKey));
  const json = doc.draft ?? doc.doc?.data ?? {};
  const encrypted = useAsyncMemo(
    () => encryptDocument(docKey, DOC_TYPE, DOC_VERSION, json ?? {}),
    [json],
  ).data;
  useEffect(() => {
    if (!formRef.current) return;
    if (doc.state !== "ready") return;
    jsonToForm(JSON.stringify(json), formRef.current);
  }, [doc.state, !!doc.draft, formRef.current]);
  if (doc.state !== "ready") {
    return <>Loading/..</>;
  }
  const handleFormChange = () => {
    if (doc.state !== "ready") {
      return;
    }
    const json = formToJSON(formRef.current!);
    doc.saveDraft(json);
  };
  const discard = (message: string) => {
    if (!confirm(message)) {
      return;
    }
    if (!doc.discard()) {
      setHash("");
    }
  };
  const discardChanges = () => {
    discard(`Discard Changes ${docKey}`);
  };
  const discardCard = () => {
    discard(`Delete Draft ${docKey}`);
  };
  return (
    <>
      <div>
        {doc.doc ? (
          doc.isDirty ? (
            <>
              Diverged from server <a href={doc.link}>{doc.link}</a>,{" "}
              {encrypted?.prUpdateAction ? (
                <button onClick={encrypted.prUpdateAction}>Update PR</button>
              ) : null}
              <button onClick={discardChanges}>Discard Changes</button>
            </>
          ) : (
            <a href={doc.link}>{doc.link}</a>
          )
        ) : isEmptyCard(doc.draft) ? (
          <>
            Card Empty
            <button onClick={discardChanges}>Discard</button>
          </>
        ) : (
          <>
            Not Stored on server{" "}
            {encrypted?.prCreateLink ? (
              <a href={encrypted.prCreateLink}>Create PR</a>
            ) : null}
            <button onClick={discardCard}>Discard Card</button>
          </>
        )}
      </div>
      <div>
        <a href={`/print#${doc.docKey}`}>Print</a>
      </div>
      <CardDisplay docKey={docKey} link={doc.link} json={json} />
      <form ref={formRef} onInput={handleFormChange}>
        <CardForm />
      </form>
      <details>
        <summary>Advanced</summary>
        <div>
          <input
            type="text"
            size={83}
            ref={fileRef}
            disabled
            defaultValue={`${encrypted?.fileName ?? ""}`}
          />
          <br />
          <textarea
            cols={50}
            rows={15}
            ref={docRef}
            disabled
            defaultValue={
              encrypted?.encrypted
                ? JSON.stringify(encrypted?.encrypted, null, 2)
                : ""
            }
          />
        </div>
      </details>
    </>
  );
};
