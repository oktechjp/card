import type { CardType } from '@/docs/card'
import { Layout } from '@/components/Util/Layout'
import NotoSansJP from '@/utils/NotoSansJP'
import clsx from 'clsx'
import { useAsyncMemo } from '@/hooks/useAsyncMemo'
import encodeQR from 'qr'
import { encode, toBase64 } from '@/utils/buffer'

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

export type CardDisplayProps ={ json: CardType, link: string }
export function CardDisplay({ json, link }: CardDisplayProps) {
    const qrCode = useAsyncMemo(
        async () => {
            const data = await encodeQR(link, 'svg')
            return `data:image/svg+xml;base64,${toBase64(encode(data))}`
        },
        [link]
    )
    const isCut = true
    const viewBox = isCut
        ? '0 0 910 540'
        : '-15 -15 950 580'
    return <>
        <svg viewBox={viewBox} width="500" style={{ border: '1px solid black' }}>
            <style>{`
                ${NotoSansJP}
                /* Style the text */
                text {
                    /* Specify the system or custom font to use */
                    font-family: "Noto Sans JP", sans-serif;
                    font-size: 22px;
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
            <rect x={-15} y={-15} width="940" height="580" fill="white" />
            <Layout style={{ marginTop: 20, width: 883, alignItems: "flex-end", flexDirection: "column" }}>
                <text style={{ fontSize: 14, fill: '#999' }}>{link}</text>
            </Layout>
            <image href="https://public.oktech.jp/images/logo-and-design/OKTech-logo-onlight-rgb.svg" width={200} x={20} y={20} />
            <Layout style={{ flexDirection: 'column', justifyContent: 'center', height: 540, paddingLeft: 140 }} className='text-block'>
                <g style={{ flexDirection: "row", alignItems: 'flex-end' }}>
                    <Big className="big--surname" text={json.surname} kana={'surname-kana' in json ? (json['surname-kana'] as string) : json.surname_kana ?? undefined} />
                    <g style={{ width: 20 }} />
                    <Big text={json.firstname} kana={json.firstname_kana} />
                </g>
                {json.subtitle ? <text style={{ marginBottom: 20, marginTop: -10 }}>{json.subtitle}</text> : null}
                {json.email ? <text style={{ marginBottom: 4 }}>{json.email}</text> : null}
                {json.url ? <text>{json.url}</text> : null}
            </Layout>
            {qrCode.data ? <image href={qrCode.data} width="100" height="100" opacity={0.7} x={910-100-15} y={540-100-15} /> : null}
        </svg>
    </>
}