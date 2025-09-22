import { useHashDoc } from "@/hooks/useHashDoc";
import { HashDocumentInput } from "./HashDocumentInput";
import { CardDisplay } from "./CardDisplay";
import { useEffect, useRef, useState } from "react";
import type { DocDisplayControl } from "./DocsDisplay";
import { useButtonAction } from "@/hooks/useButtonAction";
import { DOC_TYPE, DOC_VERSION, isEmptyCard } from "@/docs/card";
import { useAsyncMemo } from "@/hooks/useAsyncMemo";
import { encryptDocument } from "@/utils/safeDoc";

export function PrintDialog() {
  const hashDoc = useHashDoc();
  const ref = useRef<DocDisplayControl>(null);
  const [verified, setVerified] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [myDesign, setMyDesign] = useState(false);
  const downloadBack = useButtonAction(
    async () => (await ref.current?.download("back")) ?? null,
  );
  const downloadFront = useButtonAction(
    async () => (await ref.current?.download("front")) ?? null,
  );
  const encrypted = useAsyncMemo(
    async () =>
      hashDoc.draft && hashDoc.docKey
        ? await encryptDocument(
            hashDoc.docKey,
            DOC_TYPE,
            DOC_VERSION,
            hashDoc.draft,
          )
        : null,
    [hashDoc.docKey, hashDoc.doc],
  );
  useEffect(
    function reset() {
      setVerified(false);
      setLoggedIn(false);
      downloadBack.lastRun = undefined;
      downloadFront.lastRun = undefined;
    },
    [hashDoc.docKey],
  );
  const { docKey, doc, draft, validId } = hashDoc;
  const link = hashDoc.state === "ready" ? hashDoc.link : null;
  const state_1 = !validId
    ? "no-input"
    : doc || isEmptyCard(draft)
      ? "doc-ready"
      : "doc-not-uploaded";
  const state_2 =
    state_1 !== "doc-ready" ? "hidden" : verified ? "verified" : "verify";
  const state_3 =
    state_2 !== "verified"
      ? "hidden"
      : downloadBack.lastRun && downloadFront.lastRun
        ? "downloaded"
        : "download";
  const state_4 =
    state_3 !== "downloaded" ? "hidden" : loggedIn ? "loggedIn" : "login";
  const state_5 = state_4 !== "loggedIn" ? "hidden" : "visible";
  return (
    <>
      <h2>Printing of a Business Card</h2>
      <p>
        <strong>👋 Hello Friend!</strong>
      </p>
      <p>
        So, you want to print your business card? Great! We prepared several
        steps that should guide you through the process!
      </p>
      <section>
        <h2>❶ Select the Business Card</h2>
        {state_1 === "no-input" ? (
          <HashDocumentInput label="We need to know which card to read. Please enter the ID in the link here." />
        ) : state_1 === "doc-ready" ? (
          <p>
            <code>{docKey}</code> selected. <a href={`/new#${docKey}`}>Edit</a>
          </p>
        ) : (
          <p>
            <code>{docKey}</code> selected. Looks like you havn't stored the
            document yet!{" "}
            {encrypted.data?.prLink ? (
              <>
                <a href={encrypted.data?.prLink}>Create a PR</a>,{" "}
              </>
            ) : null}
            <a href={`/new#${docKey}`}>Edit</a>
          </p>
        )}
      </section>
      {state_2 === "hidden" ? null : (
        <section>
          <h2>❷ Verify the Business Card.</h2>
          <p>Preview the business card. Click the checkbox if it is okay!</p>
          <CardDisplay
            {...{
              docKey,
              json: doc?.data ?? draft ?? {},
              link: link!,
              ref,
            }}
          />
          <p>
            <input
              type="checkbox"
              onChange={({ currentTarget: { checked } }) =>
                setVerified(checked)
              }
            ></input>
          </p>
        </section>
      )}
      {state_3 === "hidden" ? null : (
        <section>
          <h2>❸ Download the Business card</h2>
          <p>
            {!downloadFront.lastRun
              ? null
              : downloadFront.lastRun.success
                ? downloadFront.lastRun.data
                : downloadFront.lastRun.error.toString()}
            <button onClick={downloadFront} disabled={downloadFront.isRunning}>
              Front Side
            </button>
            {!downloadBack.lastRun
              ? null
              : downloadBack.lastRun.success
                ? downloadBack.lastRun.data
                : downloadBack.lastRun.error.toString()}
            <button onClick={downloadBack} disabled={downloadBack.isRunning}>
              Back Side
            </button>
          </p>
        </section>
      )}
      {state_4 === "hidden" ? null : (
        <section>
          <h2>❹ Open the Raksul </h2>
          <p>
            You will need a <a href="https://raksul.com">Raksul</a> account for
            this step. →{" "}
            <a href="https://raksul.com/account/login" target="_blank">
              Login&#x2F;Signup
            </a>
          </p>
          <p>
            Open the products editor for business card and select an the empty
            template.
            <img src="/assets/screenshot-06-create-new-template.png" />
          </p>
          <p>
            Use the normal settings
            <img src="/assets/screenshot-07-size-choices.png" />
          </p>
          <p>
            Upload the front and back side of the card.
            <img src="/assets/screenshot-08-upload.png" />
          </p>
          <p>
            Drag & Drop the front side on the editor and use the "配置" button
            to change the positon. Set it to 96x60 at -2.5/-2.5.
            <img src="/assets/screenshot-09-positioning.png" />
          </p>
          <p>
            Add a page then do the same thing with the background image.
            <img src="/assets/screenshot-10-add-bg.png" />
          </p>
          <p>
            Now go to order a regular business card. Select the "通常" (tsujo)
            business cards.
            <a
              target="_blank"
              href="https://raksul.com/print/businesscard/prices?size=STANDARD_BUSINESSCARD&paper=MATTE&weight=220&color=BOTH_SIDE_COLOR&rounded=ROUNDED_OFF&coating=COATING_NONE"
              onClick={() => setLoggedIn(true)}
            >
              Take me there!
            </a>
          </p>
          <p>
            Use the quality "標準"(hyojun) for and we need it colored on both
            sides. Note: if you are not in a hurry it is no problem to order the
            business cards a few days in advance. they then cost much less!
            <img src="/assets/screenshot-02-add-to-cart.png" />
            <img src="/assets/screenshot-03-selection.png" />
          </p>
          <p>
            To upload the designs use the{" "}
            <img src="/assets/screenshot-04-upload-data.png" /> and{" "}
            <img src="/assets/screenshot-05-select-mydesign.png" /> to add our
            designs.
          </p>
          <p>
            Use <strong>both</strong> template files you just created.
            <img src="/assets/screenshot-06-use-sides.png" />
          </p>
          <p>
            Follow through the data check.
            <img src="/assets/screenshot-11-data-check.png" />
          </p>
          <p>Confirm the order! Profit</p>
        </section>
      )}
      {state_5 === "hidden" ? null : (
        <section>
          <h2>❻ Select your design</h2>
          <input
            type="checkbox"
            onChange={({ currentTarget: { checked } }) => setMyDesign(checked)}
          ></input>
        </section>
      )}
    </>
  );
}
