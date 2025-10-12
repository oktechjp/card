import { useEffect, useRef } from "react";
import { jsonToForm } from "@/utils/form";
import { setHash } from "@/store/hash";
import type { SafeDocReact } from ".";
import { DocButtonList } from "./DocButtonList";

export type DocEditorMenuProps = {
  docKey?: string;
  setup: SafeDocReact;
};
export const DocEditorMenu = ({ docKey, setup }: DocEditorMenuProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const docState = setup.useDoc(docKey);
  const activeDoc =
    docState.state === "ready" ? (docState.draft ?? docState.doc) : null;
  useEffect(() => {
    if (!formRef.current) return;
    if (!activeDoc) return;
    jsonToForm(JSON.stringify(activeDoc.data), formRef.current);
  }, [activeDoc]);
  if (docState.state === "no-doc") {
    return <></>;
  }
  if (docState.state === "no-stored") {
    return <></>;
  }
  if (docState.state !== "ready" || !activeDoc) {
    return <>Loading...</>;
  }
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
    <a key="published" className="button" href={link}>
      Published version
    </a>
  );
  const publishBtn = (
    <setup.PublishButton key="publish-doc" doc={docState.draft!}>
      Publish
    </setup.PublishButton>
  );
  const previewBtn = (
    <a
      key="preview"
      className="button"
      href={setup.previewUrl(docState.docKey)}
    >
      Preview
    </a>
  );
  const links = docState.doc
    ? docState.draft
      ? [
          previewBtn,
          publishedBtn,
          <setup.PublishButton doc={docState.draft!} republish>
            Publish new version
          </setup.PublishButton>,
          discardBtn,
        ]
      : [publishedBtn]
    : docState.draft && docState.draft.type.isEmpty(docState.draft.data)
      ? [publishBtn, deleteBtn]
      : [previewBtn, publishBtn, deleteBtn];
  links.push(
    <a key="print" className="button" href={setup.printUrl(docState.docKey)}>
      Print
    </a>,
  );
  return <DocButtonList>{links}</DocButtonList>;
};
