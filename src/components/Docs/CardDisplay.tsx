import { useAsyncMemo } from '@/hooks/useAsyncMemo'
import Flexbox from '@/components/Util/svg-react-flex'
import type { CardType } from './CardForm'

let _init: Promise<void> | null = null

const Big = ({ kana, text, ref }: { kana?: string, text: string, ref?: React.Ref<any> }) => {
    return 
}

export function CardDisplay ({ json }: { json: CardType }) {
    
    return <><svg viewBox='-15 -15 940 580' width="500">
            <image href="https://public.oktech.jp/images/logo-and-design/OKTech-logo-onlight-rgb.svg" width={200} />
            <Flexbox style={{ justifyContent: 'center', height: 540 }}>
                <g>
                    <Flexbox style={{ flexDirection: "row"  }}>
                        {json.surname ? <g>
                            <Flexbox>
                                {json.surname_kana ? <text>{json.surname_kana}</text> : null}
                                <text>{json.surname}</text>
                            </Flexbox>
                        </g> : null}
                        {json.firstname ? <g>
                            <Flexbox>
                                {json.firstname_kana ? <text>{json.firstname_kana}</text> : null}
                                <text>{json.firstname}</text>
                            </Flexbox>
                        </g> : null}
                    </Flexbox>
                </g>
                {json.subtitle ? <text style={{ top: 6 }}>{json.subtitle}</text> : null}
                {json.email ? <text>{json.email}</text> : null}
                {json.url ? <text>{json.url}</text> : null}
            </Flexbox>
        </svg></>
}