import { createElement, useEffect, useMemo, useState, type ReactElement } from "react"
import { useAsyncMemo } from "@/hooks/useAsyncMemo"
import { CardDisplay } from "@/components/docs/CardDisplay"
import { fetchDocument, isPossibleDocKey } from "@/utils/safeDoc"
import { useHash } from "@/hooks/useHash"
import { useDoc } from "@/hooks/useDoc"
import type { DocDisplayProps } from "./DocsDisplay"
import { DOC_TYPE, DOC_VERSION } from "@/docs/card"

const KnownTypes = [
    {
        type: DOC_TYPE,
        version: DOC_VERSION,
        component: CardDisplay
    }
] satisfies Array<
    {
        type: string,
        version: number
        component: (props: DocDisplayProps<any>) => ReactElement
    }
>

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
