import type { CardDisplayVariantProps } from "@/components/docs/CardDisplayType";
import { Color, DEFAULT_COLOR } from "@/docs/card";
import { CARD_HEIGHT, CARD_WIDTH, CardSvg } from "@/components/docs/CardSvg";
import { ShipporiAntique } from "@/components/fonts/ShipporiAntiqueB1";
import { PermanentMarker } from "@/components/fonts/PermanentMarker";
import { EmbeddedSVGImage } from "@/components/utils/EmbeddedSVGImage";
import { useSvgSize } from "@/hooks/useSvgSize";

export function CardDisplayBack({ json, isCut, ref }: CardDisplayVariantProps) {
  const { callname, callname_kana, zoom } = useSvgSize(
    ["callname", "callname_kana"] as const,
    ({ callname, callname_kana }) => {
      if (callname) {
        const centerX = CARD_WIDTH / 2;
        const centerY = CARD_HEIGHT / 2;
        callname.move(
          centerX - callname.bounds.width / 2,
          centerY + callname.bounds.height * 0.25,
        );
        callname_kana?.move(
          centerX - callname_kana.bounds.width / 2,
          centerY -
            callname.bounds.height * 0.25 -
            callname_kana.bounds.height * 0.3,
        );
      }
    },
  );
  return (
    <CardSvg
      ref={ref}
      isCut={isCut}
      background={
        (Color[json.color ?? DEFAULT_COLOR] || Color[DEFAULT_COLOR]).rgb
      }
    >
      <style>{`
            ${PermanentMarker}
            ${ShipporiAntique}
            .font--shippori {
                font-family: 'Shippori Antique B1'
            }
            .font--permanent {
                font-family: 'Permanent Marker'
            }
            .callname {
                font-size: 120px;
                fill: #fff;
            }
            .callname_kana {
                font-size: 50px;
                fill: #fff;
            }
        `}</style>
      {zoom}
      <EmbeddedSVGImage
        href="https://public.oktech.jp/images/logo-and-design/OKTech-logo-white.svg"
        width={200}
        height={52}
        x={20}
        y={20}
      />
      <text className="font--permanent callname" ref={callname}>
        {json.callname}
      </text>
      <text className="font--shippori callname_kana" ref={callname_kana}>
        {json.callname_kana}
      </text>
    </CardSvg>
  );
}
