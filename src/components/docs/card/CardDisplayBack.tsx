import { DEFAULT_COLOR, type CardV1Type } from "@/docs/card";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  BusinessCardSvg,
} from "@/components/docs/BusinessCardSvg";
import { ShipporiAntique } from "@/components/fonts/ShipporiAntiqueB1";
import { PermanentMarker } from "@/components/fonts/PermanentMarker";
import { EmbeddedSVGImage } from "@/components/utils/EmbeddedSVGImage";
import { useSvgSize } from "@/hooks/useSvgSize";
import { ColorInfo } from "@/components/docs/card/ColorInfo";
import type { DocPageView } from "@/components/safeDoc-react/DocView";

export const CardDisplayBack: DocPageView<CardV1Type> = ({
  data: json,
  showMargins,
  ref,
}) => {
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
  const colorInfo = ColorInfo[json.color] ?? ColorInfo[DEFAULT_COLOR];
  return (
    <BusinessCardSvg ref={ref} isCut={showMargins} background={colorInfo.bg}>
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
                fill: ${colorInfo.fg};
            }
            .callname_kana {
                font-size: 50px;
                fill: ${colorInfo.fg};
            }
        `}</style>
      {zoom}
      <EmbeddedSVGImage
        href={colorInfo.logo}
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
    </BusinessCardSvg>
  );
};
