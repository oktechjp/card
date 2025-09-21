import type { ChangeEventHandler } from "react"
import { useHash } from "@/hooks/useHash"

export const HashDocumentInput = () => {
    const [hash, setHash] = useHash()
    const onchange: ChangeEventHandler<HTMLInputElement> = ({ currentTarget: { value }}) => {
        setHash(value)
    }
    return <>
        <label htmlFor="code">Please enter the secret code on the document.</label>
        <input name="code" type="text" value={hash} onChange={onchange}></input>
    </>    
}