import { CardV1 } from "@/docs/card";
import { CardForm } from "@/components/docs/card/CardForm";
import { CardView } from "@/components/docs/card/CardView";
import { createDocType, setupSafeDocReact } from "@/components/safeDoc-react";
import { createGithubButtons } from "@/components/safeDoc-react/GithubButtons";
import { RaksulBusinessCardPrint } from "@/components/docs/RaksulBusinessCardPrint";

export const setup = setupSafeDocReact(
  [
    createDocType({
      type: CardV1,
      Form: CardForm,
      Print: RaksulBusinessCardPrint,
      View: CardView,
      ...createGithubButtons((publicKey) => ({
        repo: "oktechjp/public",
        folder: "docs",
        fileName: `${publicKey}.json`,
      })),
    }),
  ],
  CardV1,
  {
    viewUrl: (docKey) => `/#${docKey}`,
    previewUrl: (docKey) => `/preview#${docKey}`,
    editUrl: (docKey) => `/edit#${docKey}`,
    printUrl: (docKey) => `/print#${docKey}`,
    redirect: (url) => {
      globalThis.location.href = url;
    },
  },
);

export const { Editors, Printer, Viewer, NewDoc } = setup;
