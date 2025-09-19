import { useAsyncMemo } from "@/hooks/useAsyncMemo"
import { createElement, useEffect, useState, type ReactElement } from "react"
import { CardDisplay } from "./CardDisplay"
import { fetchDocument } from "@/utils/safeDoc"

const useHash = (hook: (hash: string) => void, interval: number = 100) => {
    useEffect(() => {
        const doc = globalThis.document
        if (!doc) {
            return
        }
        let hash = ""
        const int = setInterval(() => {
            if (hash != doc.location.hash) {
                hash = doc.location.hash
                hook(hash)
            }
        }, interval)
        return () => clearInterval(int)
    }, [])
}

const KnownTypes: { [type: string]: (props: { json: any, link: string }) => ReactElement } = {
    'card': CardDisplay
}

export function HashDocumentHook () {
    const [possibleDoc, setPossibleDoc] = useState<string>()
    useHash((hash) => {
        const match = /^#?([0Oo1IiLl23456789AaBbCcDdEeFfGgHhJjKkMmNnPpQqRrSsTtVvWwXxYyZ]{5}-[0Oo1IiLl23456789AaBbCcDdEeFfGgHhJjKkMmNnPpQqRrSsTtVvWwXxYyZ]{5}-[0Oo1IiLl23456789AaBbCcDdEeFfGgHhJjKkMmNnPpQqRrSsTtVvWwXxYyZ]{5}-[0Oo1IiLl23456789AaBbCcDdEeFfGgHhJjKkMmNnPpQqRrSsTtVvWwXxYyZ]{5})$/.exec(hash)
        if (match) {
            setPossibleDoc(match[1])
        }
    })
    const doc = useAsyncMemo(async () => {
        if (!possibleDoc) {
            return
        }
        const json = await fetchDocument(possibleDoc)
        const type = KnownTypes[json.type]
        return createElement(
            type,
            { json: json.data, link: `https://card.oktech.jp#${possibleDoc}` }
        )
    }, [possibleDoc])
    if (doc.state === 'loading') {
        return <>Loading...</>
    }
    if (doc.state === 'error') {
        return <div>Error: {doc.error.toString()}</div>
    }
    return doc.data
}
