import { createElement, useEffect, useMemo, useState, type ReactElement } from "react"
import { useAsyncMemo } from "@/hooks/useAsyncMemo"
import { CardDisplay } from "@/components/docs/CardDisplay"
import { fetchDocument, isPossibleDocKey } from "@/utils/safeDoc"
import { useHash } from "@/hooks/useHash"
import { useDoc } from "@/hooks/useDoc"

const KnownTypes: { [type: string]: (props: { json: any, link: string }) => ReactElement } = {
    'card': CardDisplay
}

export function HashDocumentHook () {
    const [hash] = useHash()
    const json = useDoc(hash)
    const data = useMemo(
        () => {
            if (!json.data){
                return
            }
            const type = KnownTypes[json.data.type]
            return createElement(
                type,
                { json: json.data.data, link: `https://card.oktech.jp#${hash}` }
            )
        },
        [json.data]
    )
    if (json.state === 'loading') {
        return <>Loading...</>
    }
    if (json.state === 'error') {
        return <div>{json.error.toString()}</div>
    }
    return data
}
