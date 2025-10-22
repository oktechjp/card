import type { SafeDocReact } from "@/components/safeDoc-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { isReadyState } from "@/store/safeDoc-store";
import { HashInput } from "@/components/form/HashInput";
import { InputWithLabel } from "@/components/form/InputWithLabel";
import { downloadSvgImage } from "@/utils/print";
import { DocButtonList } from "./DocButtonList";

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
  const verifyRef = useRef<HTMLHeadingElement>(null);
  const downloadRef = useRef<HTMLHeadingElement>(null);
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
    const name = `${selected.type.type}_v${selected.type.version}_${selected.docKey}_${formatTime(selected.time)}_${page}.png`;
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
  useEffect(() => {
    verifyRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state_2 !== "hidden"]);
  useEffect(() => {
    downloadRef.current?.scrollIntoView({ behavior: "smooth" });
    downloadRef.current?.parentNode?.querySelector("button")?.focus();
  }, [state_3 !== "hidden"]);
  return (
    <article>
      <h2>Printing of a Document</h2>
      <p>
        <strong>👋 Hello Friend!</strong>
      </p>
      <p>
        So, you want to print your document? Great! We prepared several steps
        that should guide you through the process!
      </p>
      <section>
        <h2>1. Select the Document</h2>
        {state_1 === "no-input" ? (
          <HashInput
            label={`Please enter the ID for the ${setup.types.length === 1 ? setup.types[0].humanName : "document"} here`}
          />
        ) : state_1 === "doc-ready" ? (
          <>
            <p>
              <code>{docState.docKey}</code> selected.{" "}
              <a className="button" href="#">
                Change
              </a>
            </p>
            <p>
              <DocButtonList>
                <a
                  className="button"
                  href={docState.docKey ? setup.editUrl(docState.docKey) : ""}
                >
                  Edit
                </a>
                {confirmDraft ? (
                  <InputWithLabel
                    type="checkbox"
                    className="button"
                    onChange={({ currentTarget: { checked } }) =>
                      setConfirmDraft(checked)
                    }
                    label="Print unpublished"
                    checked={confirmDraft}
                  />
                ) : (
                  <></>
                )}
              </DocButtonList>
            </p>
          </>
        ) : (
          <>
            <p>
              <code>{docState.docKey}</code> selected.
              <a className="button" href="#">
                Change
              </a>
            </p>
            <p>
              Looks like you havn't published the {draft?.type.humanName}!{" "}
              <DocButtonList>
                {[
                  ...(docState.state === "ready" && docState.draft
                    ? [
                        docState.doc ? (
                          <setup.PublishButton doc={docState.doc} republish>
                            republish
                          </setup.PublishButton>
                        ) : (
                          <setup.PublishButton doc={docState.draft}>
                            publish
                          </setup.PublishButton>
                        ),
                        <InputWithLabel
                          type="checkbox"
                          className="button"
                          onChange={({ currentTarget: { checked } }) =>
                            setConfirmDraft(checked)
                          }
                          label="Print Unpublished"
                        />,
                      ]
                    : []),

                  <a
                    className="button"
                    href={docState.docKey ? setup.editUrl(docState.docKey) : ""}
                  >
                    Edit
                  </a>,
                ]}
              </DocButtonList>
            </p>
          </>
        )}
      </section>
      {state_2 === "hidden" ? null : (
        <section>
          <h2 ref={verifyRef}>2. Verify the {selected?.type.humanName}.</h2>
          <p>
            Preview the business card. Confirm the checkbox if it is okay!
            <InputWithLabel
              type="checkbox"
              className="button"
              onChange={({ currentTarget: { checked } }) =>
                setVerified(checked)
              }
              label="Confirm"
              checked={verified}
            />
          </p>
          <div className="print--pages">
            {pages && selected && TypeView
              ? pages.map((page) => {
                  pageRefs.current.delete(page.id);
                  return (
                    <div key={page.id} className="print--page">
                      <TypeView
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
                    </div>
                  );
                })
              : `Surprisingly the document isnt ready (${docState.state})`}
          </div>
        </section>
      )}
      {state_3 === "hidden" ? null : (
        <section>
          <h2 ref={downloadRef}>3. Download the Business card</h2>
          <DocButtonList>
            {(pages ?? []).map((page) => {
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
          </DocButtonList>
        </section>
      )}
      {state_4 === "hidden" ? null : PrintView && selected ? (
        <PrintView {...selected} />
      ) : null}
    </article>
  );
}
