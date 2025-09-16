import { useAsyncMemo } from "@/hooks/useAsyncMemo"
import { useEffect, useState, type ReactElement } from "react"
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

const KnownTypes: { [type: string]: (json: any) => ReactElement } = {
    'card': (json: any): ReactElement => {
        return <CardDisplay json={json}/>
    }
}

export function HashDocumentHook () {
    const [possibleDoc, setPossibleDoc] = useState<string>()
    useHash((hash) => {
        console.log({ hash })
        const match = /^#?([0Oo1IiLl23456789AaBbCcDdEeFfGgHhJjKkMmNnPpQqRrSsTtVvWwXxYyZ]{5}-[0Oo1IiLl23456789AaBbCcDdEeFfGgHhJjKkMmNnPpQqRrSsTtVvWwXxYyZ]{5}-[0Oo1IiLl23456789AaBbCcDdEeFfGgHhJjKkMmNnPpQqRrSsTtVvWwXxYyZ]{5}-[0Oo1IiLl23456789AaBbCcDdEeFfGgHhJjKkMmNnPpQqRrSsTtVvWwXxYyZ]{5})$/.exec(hash)
        if (match) {
            setPossibleDoc(match[1])
        }
    })
    console.log('hi')
    const doc = useAsyncMemo(async () => {
        if (!possibleDoc) {
            return
        }
        console.log({ possibleDoc })
        const doc = await fetchDocument(possibleDoc)
        const type = KnownTypes[doc.type]
        return type(doc)
    }, [possibleDoc])
    return doc.data ?? <></>
}
