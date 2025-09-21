import { useEffect, useMemo, useRef } from "react"
import { formToJSON, jsonToForm } from "@/utils/form";
import { CardDisplay } from "@/components/docs/CardDisplay";
import { ColorType, CountryGroups, DEFAULT_COLOR, DOC_TYPE, DOC_VERSION, type CardType, type CountryGroup } from "@/docs/card";
import { useStore } from "@nanostores/react";
import { docs } from "@/store/doc";
import { useAsyncMemo } from "@/hooks/useAsyncMemo";
import { encryptDocument } from "@/utils/safeDoc";
import { setHash } from "@/store/hash";
import { InputWithLabel } from "./InputWithLabel";
import { SelectWithLabel } from "./SelectWithLabel";

export type CardFormProps = {
    privateKey: string
}
export const CardForm = ({ privateKey }: CardFormProps) => {
    const formRef = useRef<HTMLFormElement>(null)
    const fileRef = useRef<HTMLInputElement>(null)
    const docRef = useRef<HTMLTextAreaElement>(null)
    const doc = useStore(docs(privateKey))
    const json = doc.draft ?? doc.doc?.data
    const encrypted = useAsyncMemo(
        async () => await encryptDocument(privateKey, DOC_TYPE, DOC_VERSION, json ?? {}),
        [json]
    )
    const createPRLink = useMemo(() => {
        const { data } = encrypted
        if (!data) {
            return
        }
        const url = new URL(`https://github.com/oktechjp/public/new/main/docs`)
        url.searchParams.append('filename', data.fileName)
        url.searchParams.append('value', JSON.stringify(data.encrypted, null, 2))
        return url.toString()
    }, [encrypted])
    useEffect(() => {
        if (!formRef.current) return
        if (doc.state !== 'ready') return
        jsonToForm(JSON.stringify(json), formRef.current)
    }, [doc.state, !!doc.draft, formRef.current])
    if (doc.state !== 'ready') {
        return <>Loading/..</>
    }
    const handleFormChange = () => {
        if (doc.state !== 'ready') {
            return
        }
        const json = formToJSON(formRef.current!)
        doc.saveDraft(json)
    }
    const discard = (message: string) => {
        if (!confirm(message)) {
            return
        }
        if (!doc.discard()) {
            setHash('')
        }
    }
    const discardChanges = () => {
        discard(`Discard Changes ${privateKey}`)
    }
    const discardCard = () => {
        discard(`Delete Draft ${privateKey}`)
    }
    return <>
        <div>
            {doc.doc ?
                doc.isDirty
                    ? <>
                        Diverged from server <a href={doc.link}>{doc.link}</a>, {createPRLink ? <a href={createPRLink}>Create PR</a> : null}

                        <button onClick={discardChanges}>Discard Changes</button>
                    </>
                    : <a href={doc.link}>{doc.link}</a>
                : <>
                    Not Stored on server {createPRLink ? <a href={createPRLink}>Create PR</a> : null}

                    <button onClick={discardCard}>Discard Card</button>
                </>
            }
        </div>
        <CardDisplay docKey={privateKey} link={doc.link} json={json as CardType} />
        <form ref={formRef} onInput={handleFormChange}>
            <InputWithLabel name="surname" label="Surname" />
            <InputWithLabel name="surname_kana" label="Surname Kana" />
            <InputWithLabel name="firstname" label="Firstname" />
            <InputWithLabel name="firstname_kana" label="Firstname Kana" />
            <InputWithLabel name="callname" label="Callname" />
            <InputWithLabel name="callname_kana" label="Callname Kana" />
            <InputWithLabel name="subtitle" label="Subtitle" />
            <InputWithLabel name="email" label="Email" />
            <InputWithLabel name="url" label="URL" />
            <SelectWithLabel name="color" label="Color" defaultValue={DEFAULT_COLOR}>
                {Object.entries(ColorType).map(([key, value]) => 
                    <option key={key} value={key}>{value}</option>
                )}
            </SelectWithLabel>
            <InputWithLabel name="description" label="Description" />
            <CountrySelect name="bottom1" label="Icon A" />
            <CountrySelect name="bottom2" label="Icon B" />
        </form>
        <details>
            <summary>Advanced</summary>
            <div>
                <input type="text" size={83} ref={fileRef} disabled defaultValue={`${encrypted.data?.fileName ?? ''}`} /><br />
                <textarea cols={50} rows={15} ref={docRef} disabled defaultValue={encrypted.data?.encrypted ? JSON.stringify(encrypted.data?.encrypted, null, 2) : ''} />
            </div>
        </details>
    </>
}

export type CountrySelectProps = {
    name: string
    label: string
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
function CountrySelect ({ name, label }: CountrySelectProps) {
    return <SelectWithLabel name={name} defaultValue="" label={label}>
        <option value="">-</option>
        {CountryGroups.map(group => <OptionGroup key={group.name} group={group} />)}
    </SelectWithLabel>
}