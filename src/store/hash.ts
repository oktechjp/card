import { atom, computed, onMount } from "nanostores";

function getHash() {
  const newHash = globalThis.document?.location.hash ?? "";
  if (newHash[0] === "#") {
    return newHash.substring(1);
  }
  return newHash;
}
const internal = atom<string>(getHash());

onMount(internal, () => {
  const doc = globalThis.document;
  if (!doc) {
    return;
  }
  const int = setInterval(() => {
    const newHash = getHash();
    if (internal.get() !== newHash) {
      internal.set(newHash);
    }
  }, 100);
  return () => clearInterval(int);
});

export function setHash(hash: string) {
  internal.set(hash);
  document.location.hash = `#${hash}`;
}

export const hashStore = computed(internal, (value) => value);
