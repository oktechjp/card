import { createElement } from "react";
import { KnownTypes } from "@/components/KnownTypes";
import { DocKeyInput } from "@/components/form/DocKeyInput";
import { useHashDoc } from "@/hooks/useHashDoc";

export function DocView() {
  const fromHash = useHashDoc();
  const { doc } = fromHash;
  if (fromHash.state === "no-doc" || !doc) {
    return (
      <>
        <DocKeyInput
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
    link: fromHash.docKey,
    docKey: fromHash.docKey,
  });
}
