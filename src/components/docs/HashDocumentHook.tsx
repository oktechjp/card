import { createElement } from "react";
import { KnownTypes } from "@/components/KnownTypes";
import { HashDocumentInput } from "@/components/docs/HashDocumentInput";
import { useHashDoc } from "@/hooks/useHashDoc";

export function HashDocumentHook() {
  const fromHash = useHashDoc();
  const { doc } = fromHash;
  if (fromHash.state === "no-doc" || !doc) {
    return (
      <>
        <HashDocumentInput
          label={
            fromHash.state !== "loading" && fromHash.validId
              ? "Document not found. Maybe you mistook?"
              : "Please enter the ID from the card."
          }
        />
        {fromHash.state === "loading" ? <>Loading...</> : null}
      </>
    );
  }
  const type = KnownTypes.find(
    (type) => type.type === doc.type && type.version === doc.version,
  );
  if (!type) {
    return <>Error: Unknown type</>;
  }
  return createElement(type.component, {
    json: doc.data,
    link: doc.link,
    docKey: fromHash.docKey,
  });
}
