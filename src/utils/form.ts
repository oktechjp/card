
export type JSONObj = { [any: string]: any }

export function jsonToForm(input?: string, form?: HTMLFormElement) {
    if (!form) {
        return
    }
    let json: JSONObj
    try {
        json = JSON.parse(input ?? '')
    } catch (e) {
        console.warn(e)
        return false
    }
    for (const elem of form.elements) {
        if (elem instanceof HTMLInputElement) {
            const name = elem.name
            let value = json[name] ?? null
            if (elem.type === 'radio') {
                elem.checked = value === elem.value
                continue
            }
            if (elem.type === 'checkbox') {
                if (Array.isArray(value)) {
                    elem.checked = value.includes(elem.value)
                }
                continue
            }
            if (value === null || value === undefined) {
                value = ""
            }
            elem.value = value
        }
        if (elem instanceof HTMLSelectElement) {
            let value = json[elem.name] ?? null
            for (const option of elem.options) {
                if (option instanceof HTMLOptionElement) {
                    option.selected = value === option.value
                }
            }
        }
    }
    return true
}
export function formToJSON(input: HTMLFormElement): JSONObj {
    const json: JSONObj = {}
    for (const elem of input.elements) {
        if (elem instanceof HTMLSelectElement) {
            const name = elem.name
            for (const option of elem.options) {
                if (option.selected) {
                    if (!option.defaultSelected) {
                        json[name] = option.value
                    }
                    break
                }
            }
            continue
        }
        if (elem instanceof HTMLInputElement) {
            const name = elem.name.toString()
            const value = elem.value.trim()
            if (elem.type === 'checkbox') {
                let arr = json[name] ?? []
                if (elem.checked && value !== "") {
                    arr.push(value)
                }
                json[name] = arr
                continue
            }
            if (elem.type === 'radio') {
                if (elem.checked && value !== "") {
                    json[name] = value
                }
                continue
            }
            if (value === "") {
                continue
            }
            json[name] = value
        }
    }
    return json
}
