import type { DocTypeDefinition } from "@/utils/codecs";
import type { SafeDocReact } from ".";
import { useRef } from "react";
import { createDoc } from "@/store/safeDoc-store";
import { NewDocDialog } from "./NewDocDialog";

export type DocNewProps = {
  setup: SafeDocReact;
  type: DocTypeDefinition;
};
export const DocNew = ({ setup }: DocNewProps) => {
  const newDocDialog = useRef<HTMLDialogElement>(null);
  const onNewDoc = (type: DocTypeDefinition, privateKey: string) => {
    const doc = createDoc(type, privateKey);
    alert(`Created new ${type.humanName}. Redirecting to the editor.`);
    setup.redirect(setup.editUrl(doc));
  };
  const onOpenDialog = () => newDocDialog.current?.showModal();
  return (
    <>
      <button onClickCapture={onOpenDialog}>Create</button>
      <NewDocDialog
        ref={newDocDialog}
        types={setup.types}
        onSuccess={onNewDoc}
      />
    </>
  );
};
