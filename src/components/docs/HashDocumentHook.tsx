import { createElement } from "react";
import { KnownTypes } from "@/components/KnownTypes";
import { HashDocumentInput } from "@/components/docs/HashDocumentInput";
import { useHashDoc } from "@/hooks/useHashDoc";

export function HashDocumentHook() {
  const fromHash = useHashDoc();
  if (fromHash.state === "loading") {
    return <>Loading...</>;
  }
  if (fromHash.state === "no-doc") {
    return (
      <HashDocumentInput label="Please enter the secret code on the document." />
    );
  }
  const { doc } = fromHash;
  if (!doc) {
    return <div>Not found.</div>;
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
