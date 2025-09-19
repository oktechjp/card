import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { formToJSON, jsonToForm } from "@/utils/form";
import { decryptDocument, encryptDocument, getLocalStorageDocKey } from "@/utils/safeDoc";
import { useAsyncMemo } from "@/hooks/useAsyncMemo";
import { CardDisplay } from "@/components/docs/CardDisplay";
import { ColorType, CountryGroups, DOC_TYPE, DOC_VERSION, type CardType, type CountryGroup } from "@/docs/card";
import { useDoc } from "@/hooks/useDoc";
import useLocalStorageState from "use-local-storage-state";

export type CardFormProps = {
    privateKey: string
}
export const CardForm = ({ privateKey }: CardFormProps) => {
    const formRef = useRef<HTMLFormElement>(null)
    const jsonRef = useRef<HTMLTextAreaElement>(null)
    const fileRef = useRef<HTMLInputElement>(null)
    const docRef = useRef<HTMLTextAreaElement>(null)
    const decryptedRef = useRef<HTMLTextAreaElement>(null)
    const [localStorage, setLocalStorage] = useLocalStorageState(getLocalStorageDocKey(privateKey))
    const json = localStorage ?? {}
    const encrypted = useAsyncMemo(
        async () => await encryptDocument(privateKey, DOC_TYPE, DOC_VERSION, json),
        [json]
    )
    useEffect(() => {
        if (!formRef.current) return
        jsonToForm(JSON.stringify(json), formRef.current)
    }, [json, formRef.current])
    const decrypted = useAsyncMemo(
        async () => encrypted.data ? decryptDocument(encrypted.data.privateKey, encrypted.data.encrypted) : null,
        [encrypted.data]
    )
    const stored = useDoc(privateKey)
    const handleFormChange = () => {
        const json = formToJSON(formRef.current!)
        setLocalStorage(json)
    }
    const handleJsonChange = () => {
        jsonToForm(jsonRef.current!.value, formRef.current!)
        handleFormChange()
    }
    const createPRLink = useMemo(() => {
        const { data } = encrypted
        if (!data) {
            return
        }
        const url = new URL(`https://github.com/oktechjp/public/new/main/docs`)
        url.searchParams.append('filename', data.fileName)
        url.searchParams.append('value', JSON.stringify(data.encrypted, null, 2))
        return url.toString()
    }, [encrypted.data])
    if (!encrypted.data) {
        return <>Decrypting</>
    }
    return <>
        <div>
            {stored.loading ? '⌛︎' : stored.state === 'error' ? <>
                Not Stored on server {createPRLink ? <a href={createPRLink}>Create PR</a> : null}
            </> : <a href={encrypted.data.link}>{encrypted.data.link}</a>}
        </div>
        <CardDisplay link={encrypted.data.link} key={JSON.stringify(json)} json={json as CardType} />
        <form ref={formRef} onInput={handleFormChange}>
            <div>
                <label htmlFor="surname">Surname</label>
                <input name="surname" type="text" />
            </div>
            <div>
                <label htmlFor="surname_kana">Surname Kana</label>
                <input name="surname_kana" type="text" />
            </div>
            <div>
                <label htmlFor="firstname">Firstname</label>
                <input name="firstname" type="text" />
            </div>
            <div>
                <label htmlFor="firstname_kana">Firstname Kana</label>
                <input name="firstname_kana" type="text" />
            </div>
            <div>
                <label htmlFor="callname">Callname</label>
                <input name="callname" type="text" />
            </div>
            <div>
                <label htmlFor="callname_kana">Callname Kana</label>
                <input name="callname_kana" type="text" />
            </div>
            <div>
                <label htmlFor="subtitle">Subtitle</label>
                <input name="subtitle" type="text" />
            </div>
            <div>
                <label htmlFor="email">Email</label>
                <input name="email" type="email" />
            </div>
            <div>
                <label htmlFor="url">URL</label>
                <input name="url" type="url" />
            </div>
            <div>
                <label htmlFor="color">Color</label>
                <select name="color">
                    {Object.entries(ColorType).map(([key, value]) => 
                        <option key={key} value={key}>{value}</option>
                    )}
                </select>
            </div>
            <div>
                <label htmlFor="description">Description</label>
                <input name="description" type="text" />
            </div>
            <div>
                <label htmlFor="bottom1">Icon A</label>
                <CountrySelect name="bottom1" />
            </div>
            <div>
                <label htmlFor="bottom2">Icon B</label>
                <CountrySelect name="bottom2" />
            </div>
        </form>
        <details>
            <summary>Advanced</summary>
            <textarea onInput={handleJsonChange} ref={jsonRef} /><br />
            <div>
                <input type="text" size={83} ref={fileRef} disabled defaultValue={`${encrypted.data?.fileName ?? ''}`} /><br />
                <textarea cols={50} rows={15} ref={docRef} disabled defaultValue={encrypted.data?.encrypted ? JSON.stringify(encrypted.data?.encrypted, null, 2) : ''} />
            </div>
            <div>
                {decrypted.loading ? "Loading..." : decrypted.state === 'error' ? decrypted.error.toString() : "OK"}<br />
                <textarea cols={50} rows={15} ref={decryptedRef} disabled defaultValue={decrypted.data ? JSON.stringify(decrypted.data, null, 2) : ''} />
            </div>
        </details>
    </>
}

export type CountrySelectProps = {
    name: string
}
function OptionGroup({ group, parent }:  { group: CountryGroup, parent?: string }) {
    const name = parent ? `${parent} - ${group.name}` : group.name
    const options = Object
            .entries(group.countries ?? {})
            .sort(([_, a], [__, b]) => a > b ? 1 : b > a ? -1 : 0)
            .map(([value, name]) => {
                return <option key={value} value={value}>{name}</option>
            })
    return <>
        {options.length > 0 ? <optgroup label={name} key={name}>{options}</optgroup> : null}
        {(group.groups ?? []).map(group => <OptionGroup key={group.name} group={group} parent={name} />)}
    </>
}
function CountrySelect ({ name }: CountrySelectProps) {
    return <select name={name}>
        <option value="">-</option>
        {CountryGroups.map(group => <OptionGroup key={group.name} group={group} />)}
    </select>
}