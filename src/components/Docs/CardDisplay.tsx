import type { CardType } from '@/docs/card'
import { Layout } from '@/components/Util/Layout'

let _init: Promise<void> | null = null

const Big = ({ kana, text }: { kana?: string, text?: string }) => {
    if (!text) return <></>
    return <g style={{ flexDirection: 'column', marginRight: 5 }}>
        {kana ? <text>{kana}</text> : null}
        <text>{text}</text>
    </g>
}

export function CardDisplay ({ json }: { json: CardType }) {
    return <>
        <svg viewBox='-15 -15 940 580' width="500" style={{ border: '1px solid black'}}>
            <image href="https://public.oktech.jp/images/logo-and-design/OKTech-logo-onlight-rgb.svg" width={200} />
            <Layout style={{ flexDirection: 'column', justifyContent: 'center', height: 540 }}>
                <g style={{ flexDirection: "row", alignItems: 'flex-end' }}>
                    <Big text={json.surname}  kana={'surname-kana' in json ? (json['surname-kana'] as string) : json.surname_kana ?? undefined} />
                    <Big text={json.firstname} kana={json.firstname_kana} />
                </g>
                {json.subtitle ? <g><text style={{ marginTop: 6 }}>{json.subtitle}</text></g> : null}
                {json.email ? <g><text>{json.email}</text></g> : null}
                {json.url ? <g><text>{json.url}</text></g> : null}
            </Layout>
        </svg>
    </>
}