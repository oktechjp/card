import type { CardDisplayVariantProps } from "@/components/docs/CardDisplayType";
import { Color } from "@/docs/card";
import { CARD_HEIGHT, CARD_WIDTH, CardSvg } from "@/components/docs/CardSvg";
import { ShipporiAntique } from "@/components/fonts/ShipporiAntiqueB1";
import { PermanentMarker } from "@/components/fonts/PermanentMarker";
import { useSvgSize } from "@/hooks/useSvgSize";

export function CardDisplayBack({ json, isCut }: CardDisplayVariantProps) {
    const { callname, callname_kana, zoom } = useSvgSize(
        ['callname', 'callname_kana'] as const,
        ({ callname, callname_kana }) => {
            if (callname) {
                const centerX = (CARD_WIDTH / 2)
                const centerY = (CARD_HEIGHT / 2)
                callname.move(
                    centerX - callname.bounds.width / 2,
                    centerY + callname.bounds.height * .25
                )
                callname_kana?.move(
                    centerX - callname_kana.bounds.width / 2,
                    centerY - callname.bounds.height * .25 - callname_kana.bounds.height * .3
                )
            }
        }
    )
    return <CardSvg isCut={isCut} background={((json.color ? Color[json.color] : null) || Color.red).rgb}>
        <style>{`
            ${PermanentMarker}
            ${ShipporiAntique}
            text {
                color: #fff;
                font-size: 105;
            }     
        `}</style>
        {zoom}
        <image href="https://public.oktech.jp/images/logo-and-design/OKTech-logo-white.svg" width={200} x={20} y={20} />
        <text ref={callname} style={{ fontSize: 100, fontFamily: 'Permanent Marker', fill: "white" }}>{json.callname}</text>
        <text ref={callname_kana} style={{ fontSize: 30, fontFamily: 'Shippori Antique B1', fill: "white" }}>{json.callname_kana}</text>
    </CardSvg>
}
