import { createElement, useMemo, type ChangeEventHandler, type ReactElement } from "react"
import { isPossibleDocKey } from "@/utils/safeDoc"
import { useHash } from "@/hooks/useHash"
import { useDoc } from "@/hooks/useDoc"
import { KnownTypes } from '@/components/KnownTypes'

export function HashDocumentHook () {
    const [hash, setHash] = useHash()
    const json = useDoc(hash)
    const data = useMemo(
        () => {
            if (!json.data){
                return
            }
            const type = KnownTypes.find(type => type.type === json.data.type && type.version === json.data.version)
            if (!type) {
                throw new Error(`Unsupported type: ${type}`)
            }
            return createElement(
                type.component,
                {
                    json: json.data.data,
                    link: `https://card.oktech.jp#${hash}`,
                    docKey: hash
                }
            )
        },
        [json.data]
    )
    if ( !isPossibleDocKey(hash)) {
        const onchange: ChangeEventHandler<HTMLInputElement> = ({ currentTarget: { value }}) => {
            setHash(value)
        }
        return <form className="hash-input">
            <label htmlFor="code">Please enter the secret code on the document.</label>
            <input name="code" type="text" value={hash} onChange={onchange}></input>
        </form>
    }
    if (json.state === 'loading') {
        return <>Loading...</>
    }
    if (json.state === 'error') {
        return <div>{json.error.toString()}</div>
    }
    return data
}
