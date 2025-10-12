import type { SafeDocReact } from "@/components/safeDoc-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { isReadyState } from "@/store/safeDoc-store";
import { HashInput } from "@/components/form/HashInput";
import { InputWithLabel } from "@/components/form/InputWithLabel";
import { downloadSvgImage } from "@/utils/print";

function formatTime(date: Date) {
  return `${date.getUTCFullYear()}${date
    .getUTCMonth()
    .toString()
    .padStart(2, "0")}${date.getUTCDate().toString().padStart(2, "0")}-${date
    .getUTCHours()
    .toString()
    .padStart(2, "0")}${date.getUTCMinutes().toString().padStart(2, "0")}${date
    .getUTCSeconds()
    .toString()
    .padStart(2, "0")}`;
}

export interface DocPrinterProps {
  docKey?: string;
  setup: SafeDocReact;
}
export function DocPrinter({ docKey, setup }: DocPrinterProps) {
  const docState = setup.useHashDoc(docKey);
  const ready = isReadyState(docState) ? docState : undefined;
  const [verified, setVerified] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [confirmDraft, setConfirmDraft] = useState(false);
  const pageRefs = useRef<Map<string, SVGSVGElement>>(new Map());
  const [downloaded, setDownloaded] = useState(
    {} as Record<
      string,
      { lastRun: Date } & ({ success: true } | { success: false; error: Error })
    >,
  );
  useEffect(
    function reset() {
      setVerified(false);
      setLoggedIn(false);
      setConfirmDraft(false);
      setDownloaded({});
    },
    [docState.docKey],
  );
  const draft = ready?.draft ? { isDraft: true, ...ready.draft } : undefined;
  const published = ready?.doc ? { isDraft: false, ...ready.doc } : undefined;
  const selected = confirmDraft ? (draft ?? published) : published;
  const TypeView = selected?.type ? setup.views.get(selected.type) : undefined;
  const PrintView = selected?.type
    ? setup.prints.get(selected.type)
    : undefined;
  const downloadPage = (page: string) => {
    if (!selected) {
      return;
    }
    const svg = pageRefs.current.get(page);
    if (!svg) {
      return;
    }
    const name = `${selected.type.type}_v${selected.type.version}_${selected.docKey}_${formatTime(selected.time)}.png`;
    downloadSvgImage(svg, name, {
      scaleFactor: 4,
    }).then(
      () =>
        setDownloaded((input) => ({
          ...input,
          [page]: { success: true, lastRun: new Date() },
        })),
      (error) =>
        setDownloaded((input) => ({
          ...input,
          [page]: { success: false, error, lastRun: new Date() },
        })),
    );
  };
  const pages = selected ? selected.type.getPages(selected.data) : null;
  const state_1 =
    docState.state !== "ready"
      ? "no-input"
      : selected
        ? "doc-ready"
        : "doc-not-uploaded";
  const state_2 =
    state_1 !== "doc-ready" ? "hidden" : verified ? "verified" : "verify";
  const state_3 =
    state_2 !== "verified"
      ? "hidden"
      : !pages?.reduce(
            (missing, page) =>
              missing || !downloaded[page.id] || !downloaded[page.id].success,
            false,
          )
        ? "downloaded"
        : "download";
  const state_4 =
    // @ts-ignore
    state_3 !== "downloaded" ? "hidden" : loggedIn ? "loggedIn" : "login";
  return (
    <>
      <h2>Printing of a Document</h2>
      <p>
        <strong>👋 Hello Friend!</strong>
      </p>
      <p>
        So, you want to print your document? Great! We prepared several steps
        that should guide you through the process!
      </p>
      <section>
        <h2>❶ Select the Document</h2>
        {state_1 === "no-input" ? (
          <HashInput label="Please enter the ID for the document here." />
        ) : state_1 === "doc-ready" ? (
          <p>
            <code>{docState.docKey}</code> selected.{" "}
            <a href="#">Change</a>
            <a href={docState.docKey ? setup.editUrl(docState.docKey) : ""}>
              Edit
            </a>
            {confirmDraft ? (
              <InputWithLabel
                type="checkbox"
                onChange={({ currentTarget: { checked } }) =>
                  setConfirmDraft(checked)
                }
                label="Skip"
                checked={confirmDraft}
              />
            ) : (
              <></>
            )}
          </p>
        ) : (
          <p>
            <code>{docState.docKey}</code> selected.
            <a href="#">Change</a> Looks like you havn't
            published the {selected?.type.humanName}!{" "}
            {docState.state === "ready" && docState.draft ? (
              <>
                {docState.doc ? (
                  <>
                    <setup.RepublishButton doc={docState.doc}>
                      republish
                    </setup.RepublishButton>
                    ,{" "}
                  </>
                ) : (
                  <>
                    <setup.PublishButton doc={docState.draft}>
                      publish
                    </setup.PublishButton>
                    ,{" "}
                  </>
                )}
                <InputWithLabel
                  type="checkbox"
                  onChange={({ currentTarget: { checked } }) =>
                    setConfirmDraft(checked)
                  }
                  label="Skip"
                />
              </>
            ) : null}
            <a href={docState.docKey ? setup.editUrl(docState.docKey) : ""}>
              Edit
            </a>
          </p>
        )}
      </section>
      {state_2 === "hidden" ? null : (
        <section>
          <h2>❷ Verify the {selected?.type.humanName}.</h2>
          <p>Preview the business card. Click the checkbox if it is okay!</p>
          {pages && selected && TypeView
            ? pages.map((page) => {
                pageRefs.current.delete(page.id);
                return (
                  <TypeView
                    key={page.id}
                    page={page.id}
                    ref={(content) => {
                      if (content) {
                        pageRefs.current.set(page.id, content);
                      } else {
                        pageRefs.current.delete(page.id);
                      }
                    }}
                    {...selected}
                    showMargins={false}
                  />
                );
              })
            : `Surprisingly the document isnt ready (${docState.state})`}
          <p>
            <InputWithLabel
              type="checkbox"
              onChange={({ currentTarget: { checked } }) =>
                setVerified(checked)
              }
              label="Confirm"
              checked={verified}
            />
          </p>
        </section>
      )}
      {state_3 === "hidden" ? null : (
        <section>
          <h2>❸ Download the Business card</h2>
          <p>
            {pages?.map((page) => {
              const download = downloaded[page.id] ?? {
                lastRun: null,
              };
              return (
                <Fragment key={page.id}>
                  {download.lastRun ? (
                    download.success ? (
                      <>Downloaded</>
                    ) : (
                      <>{download.error}</>
                    )
                  ) : null}
                  <button key={page.id} onClick={() => downloadPage(page.id)}>
                    {page.label}
                  </button>
                </Fragment>
              );
            })}
          </p>
        </section>
      )}
      {state_4 === "hidden" ? null : PrintView && selected ? (
        <PrintView {...selected} />
      ) : null}
    </>
  );
}
