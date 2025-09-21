import { useId } from "react"

export type InputWithLabelProps = {
    label: string,
    name: string,
    type?: string
    defaultValue?: string
}
export function InputWithLabel({ label, name, type, defaultValue }: InputWithLabelProps) {
    const id = useId()
    return <div>
        <label htmlFor={id}>{label}</label>
        <input id={id} name={name} type={type} defaultValue={defaultValue} />
    </div>
}