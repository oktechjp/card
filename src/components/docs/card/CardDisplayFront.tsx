import clsx from "clsx";
import type { Ref } from "react";
import { NotoSansJP } from "@/components/fonts/NotoSansJP";
import { CARD_SIZE, BusinessCardSvg } from "@/components/docs/BusinessCardSvg";
import { useSvgSize } from "@/hooks/useSvgSize";
import { EmbeddedSVGImage } from "@/components/utils/EmbeddedSVGImage";
import { useQRCode } from "@/hooks/useQrCode";
import { ICON_RATIOS } from "@/docs/card/icon-ratios";
import { ICON_WHITE_BG } from "@/docs/card/icon-white-bg";
import type { AllIconTypes, CardV1Type } from "@/docs/card";
import type { DocPageView } from "@/components/safeDoc-react/DocView";

type BigProps = {
  kana?: string;
  text?: string;
  className?: string;
  ref?: Ref<SVGGElement>;
};
const Big = ({ kana, text, className, ref }: BigProps) => {
  const { zoom, ...refs } = useSvgSize(
    ["regular", "kana"] as const,
    ({ regular, kana }) => {
      if (!regular) {
        return;
      }
      let y = 0;
      if (kana) {
        kana.move(
          (regular.bounds.width - kana.bounds.width) * 0.5,
          kana.bounds.height * 0.5,
        );
        y += kana.bounds.height;
      }
      regular.move(0, y + regular.bounds.height * 0.52);
    },
  );
  if (!text) return <></>;
  return (
    <g ref={ref} className={clsx("big", className)}>
      {zoom}
      {text && kana ? (
        <text ref={refs.kana} className={clsx("big--kana", className)}>
          {kana}
        </text>
      ) : null}
      <text
        ref={refs.regular}
        className={clsx("big--regular", className)}
        fontSize="40px"
      >
        {text}
      </text>
    </g>
  );
};

export const CardDisplayFront: DocPageView<CardV1Type> = ({
  type,
  docKey,
  data: json,
  isDraft,
  showMargins,
  ref,
}) => {
  const { zoom, ...refs } = useSvgSize(
    [
      "bottom1",
      "bottom2",
      "bottom3",
      "bottom4",
      "bottom5",
      "description",
      "link",
      "linkLine2",
      "subtitle",
      "surname",
      "firstname",
      "main",
      "email",
      "url",
    ] as const,
    ({
      bottom1,
      bottom2,
      bottom3,
      bottom4,
      bottom5,
      description,
      link,
      linkLine2,
      subtitle,
      surname,
      firstname,
      main,
      email,
      url,
    }) => {
      let bottomX = 25;
      let firstNameX = 0;
      const textXMax = 140;
      if (bottom1) {
        bottom1.move(
          bottomX,
          CARD_SIZE.normal.height - bottom1.bounds.height - 25,
        );
        bottomX += bottom1.bounds.width + 15;
      }
      if (bottom2) {
        bottom2.move(
          bottomX,
          CARD_SIZE.normal.height - bottom2.bounds.height - 25,
        );
        bottomX += bottom2.bounds.width + 15;
      }
      if (bottom3) {
        bottom3.move(
          bottomX,
          CARD_SIZE.normal.height - bottom3.bounds.height - 25,
        );
        bottomX += bottom3.bounds.width + 15;
      }
      if (bottom4) {
        bottom4.move(
          bottomX,
          CARD_SIZE.normal.height - bottom4.bounds.height - 25,
        );
        bottomX += bottom4.bounds.width + 15;
      }
      if (bottom5) {
        bottom5.move(
          bottomX,
          CARD_SIZE.normal.height - bottom5.bounds.height - 25,
        );
        bottomX += bottom5.bounds.width + 15;
      }
      if (description) {
        description.move(
          bottomX,
          CARD_SIZE.normal.height - 25 - description.bounds.height * 0.1,
        );
      }
      if (link) {
        const line1 = link.bounds.height + 23;
        link.move(CARD_SIZE.normal.width - link.bounds.width - 23, line1);
        linkLine2?.move(
          CARD_SIZE.normal.width - linkLine2?.bounds.width - 23,
          line1 + 20,
        );
      }
      let y = 0;
      let fOff = 0;
      if (surname) {
        surname.move(
          0,
          -Math.min(0, (surname?.bounds.height ?? 0) - surname.bounds.height),
        );
        y += surname.bounds.height * 0.7;
        fOff += surname.bounds.width + 20;
      }
      if (firstname) {
        firstNameX = fOff;
        firstname.move(
          fOff,
          -Math.min(0, (surname?.bounds.height ?? 0) - firstname.bounds.height),
        );
        y = Math.max(y, firstname.bounds.height * 0.7);
      }
      if (y > 0) {
        y += 15;
      }
      if (subtitle) {
        subtitle.move(0, y + subtitle.bounds.height * 0.4);
        y += subtitle.bounds.height + 25;
      }
      if (email) {
        email.move(0, y + email.bounds.height * 0.5);
        y += email.bounds.height + 15;
      }
      if (url) {
        url.move(0, y);
      }
      if (main) {
        let x = textXMax;
        let nameWidth = 0;
        if (firstname) {
          nameWidth = firstNameX + firstname.bounds.width;
        } else if (surname) {
          nameWidth = surname.bounds.width;
        }
        main.move(
          Math.min(x, (CARD_SIZE.normal.width - nameWidth) / 2),
          (CARD_SIZE.normal.height - main.bounds.height) / 2,
        );
      }
    },
  );
  const isEmpty = type.isEmpty(json);
  const link = isDraft
    ? isEmpty
      ? "https://card.oktech.jp/new"
      : "https://oktech.jp"
    : `https://card.oktech.jp/#${docKey}`;
  const linkLine1 = isDraft ? link : docKey;

  const qrCode = useQRCode(link);
  const { bottom1, bottom2, bottom3, bottom4, bottom5 } = json;
  return (
    <BusinessCardSvg ref={ref} isCut={!showMargins} background="white">
      <style>{`
            ${NotoSansJP}
            /* Style the text */
            text {
                font-family: "Noto Sans JP", sans-serif;
                color: #111111;
            }
            .big--regular {
                font-size: 50px;
                font-weight: normal;
            }
            .big--kana {
                font-size: 20px;
                margin-bottom: 30px;
                font-weight: normal;
            }
            .big--surname {
                font-weight: bold;
            }
        `}</style>
      {zoom}
      <EmbeddedSVGImage
        href="https://public.oktech.jp/images/logo-and-design/OKTech-logo-onlight-rgb.svg"
        width={200}
        height={52}
        x={20}
        y={20}
      />
      <g ref={refs.main}>
        <Big
          ref={refs.surname}
          className="big--surname"
          text={json.surname}
          kana={
            "surname-kana" in json
              ? (json["surname-kana"] as string)
              : (json.surname_kana ?? undefined)
          }
        />
        <Big
          ref={refs.firstname}
          text={json.firstname}
          kana={json.firstname_kana}
        />
        {json.subtitle ? (
          <text ref={refs.subtitle} style={{ fontSize: 20 }}>
            {json.subtitle}
          </text>
        ) : null}
        {json.email ? (
          <text ref={refs.email} style={{ fontSize: 20 }}>
            {json.email}
          </text>
        ) : null}
        {json.url ? (
          <text ref={refs.url} style={{ fontSize: 20 }}>
            {json.url}
          </text>
        ) : null}
      </g>
      {isEmpty || json.description ? (
        <text ref={refs.description} style={{ fontSize: 20 }}>
          {isEmpty ? "Tackle tech together in Kansai" : json.description}
        </text>
      ) : null}
      <text
        ref={refs.link}
        style={{ fontSize: 16, marginTop: 40, fill: "#aaa" }}
      >
        {linkLine1}
      </text>
      <text
        ref={refs.linkLine2}
        style={{ fontSize: 16, marginTop: 40, fill: "#aaa" }}
        visibility={!isDraft ? "visible" : "hidden"}
      >
        ↳ https://card.oktech.jp
      </text>
      {qrCode.data ? (
        <image
          href={qrCode.data}
          width="100"
          height="100"
          opacity={0.7}
          x={CARD_SIZE.normal.width - 100 - 15}
          y={CARD_SIZE.normal.height - 100 - 15}
        />
      ) : null}
      {bottom1 ? (
        <BottomIcon
          ref={refs.bottom1}
          value={bottom1 as keyof typeof AllIconTypes}
        />
      ) : null}
      {bottom2 ? (
        <BottomIcon
          ref={refs.bottom2}
          value={bottom2 as keyof typeof AllIconTypes}
        />
      ) : null}
      {bottom3 ? (
        <BottomIcon
          ref={refs.bottom3}
          value={bottom3 as keyof typeof AllIconTypes}
        />
      ) : null}
      {bottom4 ? (
        <BottomIcon
          ref={refs.bottom4}
          value={bottom4 as keyof typeof AllIconTypes}
        />
      ) : null}
      {bottom5 ? (
        <BottomIcon
          ref={refs.bottom5}
          value={bottom5 as keyof typeof AllIconTypes}
        />
      ) : null}
    </BusinessCardSvg>
  );
};

const BottomIcon = ({
  ref,
  value,
}: {
  ref: Ref<SVGImageElement>;
  value: keyof typeof AllIconTypes;
}) => {
  const border = ICON_WHITE_BG[value] ?? false;
  return (
    <EmbeddedSVGImage
      ref={ref}
      href={`/svg/${value}.svg`}
      height={20}
      width={ICON_RATIOS[value as keyof typeof ICON_RATIOS] * 20}
      style={border ? { outline: "1px solid #888" } : undefined}
    />
  );
};
