import clsx from "clsx";
import type { Ref } from "react";
import type { CardDisplayVariantProps } from "@/components/docs/CardDisplayType";
import { NotoSansJP } from "@/components/fonts/NotoSansJP";
import { CARD_HEIGHT, CARD_WIDTH, CardSvg } from "@/components/docs/CardSvg";
import { useSvgSize } from "@/hooks/useSvgSize";
import { EmbeddedSVGImage } from "@/components/utils/EmbeddedSVGImage";
import { useQRCode } from "@/hooks/useQrCode";
import { isEmptyCard } from "@/docs/card";

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
        <text ref={refs.kana} className="big--kana">
          {kana}
        </text>
      ) : null}
      <text ref={refs.regular} className="big--regular" fontSize="40px">
        {text}
      </text>
    </g>
  );
};

export function CardDisplayFront({
  json,
  link,
  isCut,
  ref,
}: CardDisplayVariantProps) {
  const { zoom, ...refs } = useSvgSize(
    [
      "bottom1",
      "bottom2",
      "description",
      "link",
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
      description,
      link,
      subtitle,
      surname,
      firstname,
      main,
      email,
      url,
    }) => {
      let bottomX = 25;
      if (bottom1) {
        bottom1.move(bottomX, CARD_HEIGHT - bottom1.bounds.height - 25);
        bottomX += bottom1.bounds.width + 15;
      }
      if (bottom2) {
        bottom2.move(bottomX, CARD_HEIGHT - bottom2.bounds.height - 25);
        bottomX += bottom2.bounds.width + 15;
      }
      if (description) {
        description.move(
          bottomX,
          CARD_HEIGHT - 25 - description.bounds.height * 0.1,
        );
      }
      link?.move(CARD_WIDTH - link.bounds.width - 25, link.bounds.height + 25);
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
        main.move(140, (CARD_HEIGHT - main.bounds.height) / 2);
      }
    },
  );
  const isEmpty = isEmptyCard(json);
  if (isEmpty) {
    link = "https://card.oktech.jp/new";
  }
  const qrCode = useQRCode(link);
  const { bottom1, bottom2 } = json;
  return (
    <CardSvg ref={ref} isCut={isCut} background="white">
      <style>{`
            ${NotoSansJP}
            /* Style the text */
            text {
                font-family: "Noto Sans JP", sans-serif;
                color: #111111;
            }
            .big--regular {
                font-size: 50px;
                font-weight: regular;
            }
            .big--kana {
                font-size: 20px;
                margin-bottom: 30px;
                font-weight: regular;
            }
            .big--surname {
                font-weight: bold;
            }
        `}</style>
      {zoom}
      <EmbeddedSVGImage
        href="https://public.oktech.jp/images/logo-and-design/OKTech-logo-onlight-rgb.svg"
        width={200}
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
        style={{ fontSize: 16, marginTop: 40, fill: "#999" }}
      >
        {link}
      </text>
      {qrCode.data ? (
        <image
          href={qrCode.data}
          width="100"
          height="100"
          opacity={0.7}
          x={CARD_WIDTH - 100 - 15}
          y={CARD_HEIGHT - 100 - 15}
        />
      ) : null}
      {bottom1 ? (
        <EmbeddedSVGImage
          ref={refs.bottom1}
          href={`/svg/${bottom1}.svg`}
          height={20}
        />
      ) : null}
      {bottom2 ? (
        <EmbeddedSVGImage
          ref={refs.bottom2}
          href={`/svg/${bottom2}.svg`}
          height={20}
        />
      ) : null}
    </CardSvg>
  );
}
