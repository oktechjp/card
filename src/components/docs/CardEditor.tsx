import { useHash } from "@/hooks/useHash"
import { createPrivateKey, getLocalStorageDocKey, isPossibleDocKey } from "@/utils/safeDoc"
import { useMemo } from "react"
import useLocalStorageState from "use-local-storage-state"
import { CardForm } from "@/components/docs/CardForm"

export function CardEditor () {
    const [importCards, exportCards] = useLocalStorageState('known-cards')
    const knownCards = useMemo(() => {
        if (!Array.isArray(importCards)) return []
        return importCards.filter(entry => (
            typeof entry === 'string' && isPossibleDocKey(entry)
        ))
    }, [importCards])
    const [hash, setHash] = useHash()
    const newCard = () => {
        const newCard = createPrivateKey()
        exportCards(() => [
            ...knownCards,
            newCard,
        ])
        setHash(newCard)
    }
    const discardCard = () => {
        if (confirm(`Delete Card ${hash}`)) {
            exportCards(knownCards.filter(card => card === hash))
            setHash('')
            localStorage.removeItem(getLocalStorageDocKey(hash))
        }
    }
    return <>
        <select value={hash} onChange={(elem) => setHash(elem.currentTarget.value)}>
            <option value="">-</option>
            {knownCards.map(privateKey => <option key={privateKey} value={privateKey}>{privateKey}</option>)}
        </select>
        {hash && isPossibleDocKey(hash) ? <button onClick={discardCard}>Discard Card</button>: null}
        <button onClick={newCard}>New Card</button>
        {hash && isPossibleDocKey(hash) ? <CardForm privateKey={hash} />: null}
    </>
}