import { useRef, useState } from "react"
import { formToJSON, jsonToForm } from "@/utils/form";
import { decryptDocument, encryptDocument } from "@/utils/safeDoc";
import { useAsyncMemo } from "@/hooks/useAsyncMemo";
import { CardDisplay } from "./CardDisplay";
import { ColorType, CountryType, DOC_TYPE, DOC_VERSION, RegionType, type CardType } from "@/docs/card";

export const Card = () => {
    const formRef = useRef<HTMLFormElement>(null)
    const jsonRef = useRef<HTMLTextAreaElement>(null)
    const fileRef = useRef<HTMLInputElement>(null)
    const docRef = useRef<HTMLTextAreaElement>(null)
    const decryptedRef = useRef<HTMLTextAreaElement>(null)
    const [json, setJson] = useState({})
    const encrypted = useAsyncMemo(
        async () => await encryptDocument(DOC_TYPE, DOC_VERSION, json),
        [json]
    )
    const decrypted = useAsyncMemo(
        async () => encrypted.data ? decryptDocument(encrypted.data.privateKey, encrypted.data.encrypted) : null,
        [encrypted.data]
    )
    const currentJSON = () => {
        const json = formToJSON(formRef.current!)
        const jsonString = JSON.stringify(json, null, 2)
        setJson(json)
        return jsonString
    }
    const handleFormChange = () => {
        jsonRef.current!.value = currentJSON()
    }
    const handleJsonChange = () => {
        jsonToForm(jsonRef.current!.value, formRef.current!)
        currentJSON()
    }
    if (!encrypted.data) {
        return <>Decrypting</>
    }
    return <>
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
                <label htmlFor="country">Country</label>
                <select name="country">
                    <option value="">-</option>
                    {Object.entries(CountryType).map(([key, value]) =>
                        <option key={key} value={key}>{value}</option>
                    )}
                </select>
            </div>
            <div>
                <label htmlFor="region">Region</label>
                <select name="region">
                    <option value="">-</option>
                    {Object.entries(RegionType).map(([key, value]) =>
                        <option key={key} value={key}>{value}</option>
                    )}
                </select>
            </div>
        </form>
        <textarea onInput={handleJsonChange} ref={jsonRef} /><br />
        <div>
            {encrypted.loading ? "Loading..." : encrypted.state === 'error' ? encrypted.error.toString() : "OK"}<br />
            <input type="text" size={40} ref={fileRef} disabled defaultValue={`${encrypted.data?.fileName ?? ''}`} /><br />
            <textarea cols={50} rows={15} ref={docRef} disabled defaultValue={encrypted.data?.encrypted ? JSON.stringify(encrypted.data?.encrypted, null, 2) : ''} />
        </div>
        <div>
            {decrypted.loading ? "Loading..." : decrypted.state === 'error' ? decrypted.error.toString() : "OK"}<br />
            <textarea cols={50} rows={15} ref={decryptedRef} disabled defaultValue={decrypted.data ? JSON.stringify(decrypted.data, null, 2) : ''} />
        </div>
        <div>
            <a href={encrypted.data.link}>{encrypted.data.link}</a>
        </div>
    </>
}