import { createElement, useMemo } from "react"
import { HashDocumentInput } from "./HashDocumentInput"
import { useStore } from '@nanostores/react'
import { docs } from "@/store/doc"
import { KnownTypes } from "../KnownTypes"
import { hashStore } from "@/store/hash"

export function HashDocumentHook () {
    const hash = useStore(hashStore)
    const fromHash = useStore(docs(hash))
    if (fromHash.state === 'loading') {
        return <>Loading...</>
    }
    if (fromHash.state === 'no-doc') {
        return <form className="hash-input">
            <HashDocumentInput />
        </form>
    }
    const { doc } = fromHash
    if (!doc) {
        return <div>Not found.</div>
    }
    const type = KnownTypes.find(type => type.type === doc.type && type.version === doc.version)
    if (!type) {
        return <>Error: Unknown type</>
    }
    return createElement(
        type.component,
        {
            json: doc.data,
            link: doc.link,
            docKey: hash
        }
    )
}
