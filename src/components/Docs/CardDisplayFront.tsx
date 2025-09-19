import { Layout } from '@/components/Util/Layout'
import NotoSansJP from '@/utils/NotoSansJP'
import clsx from 'clsx'
import { useAsyncMemo } from '@/hooks/useAsyncMemo'
import encodeQR from 'qr'
import { encode, toBase64 } from '@/utils/buffer'
import type { CardDisplayVariantProps } from './CardDisplayType'
import { CardSvg } from './CardSvg'

type BigProps = {
    kana?: string, text?: string, className?: string
}
const Big = ({ kana, text, className }: BigProps) => {
    if (!text) return <></>
    return <g style={{ flexDirection: 'column', alignItems: "center" }} className={clsx("big", className)}>
        {kana ? <text className="big--kana">{kana}</text> : null}
        <text className='big--regular' fontSize="40px">{text}</text>
    </g>
}

export function CardDisplayFront({ json, link, isCut }: CardDisplayVariantProps) {
    const qrCode = useAsyncMemo(
        async () => {
            const data = await encodeQR(link, 'svg')
            return `data:image/svg+xml;base64,${toBase64(encode(data))}`
        },
        [link]
    )
    return <CardSvg isCut={isCut} background="white">
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
        <Layout style={{ width: 883, alignItems: "flex-end", flexDirection: "column" }}>
            <text style={{ fontSize: 14, marginTop: 40, fill: '#999' }}>{link}</text>
        </Layout>
        <image href="https://public.oktech.jp/images/logo-and-design/OKTech-logo-onlight-rgb.svg" width={200} x={20} y={20} />
        <Layout style={{ flexDirection: 'column', justifyContent: 'center', height: 580, paddingLeft: 140 }} className='text-block'>
            <g style={{ flexDirection: "row", alignItems: 'flex-end' }}>
                <Big className="big--surname" text={json.surname} kana={'surname-kana' in json ? (json['surname-kana'] as string) : json.surname_kana ?? undefined} />
                <g style={{ width: 20 }} />
                <Big text={json.firstname} kana={json.firstname_kana} />
            </g>
            {json.subtitle ? <text style={{ fontSize: 20, marginBottom: 20, marginTop: -30 }}>{json.subtitle}</text> : null}
            {json.email ? <text style={{ fontSize: 20, marginBottom: 4 }}>{json.email}</text> : null}
            {json.url ? <text style={{ fontSize: 20 }}>{json.url}</text> : null}
        </Layout>
        <Layout style={{ flexDirection: "row", marginTop: 520, marginLeft: 20 }}>
            {json.description ? <text style={{ fontSize: 20 }}>{json.description}</text> : null}
        </Layout>
        {qrCode.data ? <image href={qrCode.data} width="100" height="100" opacity={0.7} x={910 - 100 - 15} y={540 - 100 - 15} /> : null}
    </CardSvg>
}