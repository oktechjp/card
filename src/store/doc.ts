import {
  createPrivateKey,
  fetchDocument,
  getPossibleDocKey,
} from "@/utils/safeDoc";
import { computed, listenKeys, mapCreator, task } from "nanostores";
import { persistentMap } from "@nanostores/persistent";
import deepEqual from "fast-deep-equal";

export type DocStore<Doctype> = (
  | {
      state: "no-doc";
    }
  | {
      state: "pending";
      saveDraft: (data: Doctype) => void;
      discard: () => void;
    }
  | {
      state: "loading";
      saveDraft: (data: Doctype) => void;
      discard: () => void;
    }
  | {
      state: "ready";
      refresh: () => void;
      saveDraft: (data: Doctype) => void;
      discard: () => boolean;
      isDirty: boolean;
      link: string;
    }
) & {
  docKey: string;
  validId: boolean;
  draft?: Doctype;
  doc?: Doctype | null;
};

const persistentIds = persistentMap<Record<string, boolean>>(
  "ids",
  {},
  {
    encode: (bool) => (bool ? "1" : "0"),
    decode: (str) => str === "1",
  },
);

const persistentDrafts = persistentMap<Record<string, any>>(
  "drafts",
  {},
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  },
);

export function createDoc() {
  const id = createPrivateKey();
  persistentIds.setKey(id, true);
  persistentDrafts.setKey(id, {});
  return id;
}

export const knownDraftIds = computed([persistentDrafts], (all) =>
  Object.keys(all),
);
export const visitedDocIds = computed(persistentIds, (all) => Object.keys(all));

export const docs = mapCreator<DocStore<any>>((store, input) => {
  const id = getPossibleDocKey(input);
  const validId = id !== null;
  const base = {
    docKey: id ?? input,
    id: input,
    validId,
  };
  if (!id) {
    store.set({ ...base, state: "no-doc" });
    return;
  }
  const discard = (): boolean => {
    const current = store.get();
    if (current.state !== "ready") {
      throw new Error("not ready yet");
    }
    if (!current.doc) {
      persistentIds.setKey(id, undefined);
    }
    persistentDrafts.setKey(id, undefined);
    return !!current.doc;
  };
  const saveDraft = (newDraft: any) => {
    persistentDrafts.setKey(id, newDraft);
  };
  store.set({ ...base, state: "pending", saveDraft, discard });
  const refresh = () => {
    store.set({
      ...store.get(),
      saveDraft,
      discard,
      state: "loading",
      draft: persistentDrafts.get()[id],
    });
    task(async () => {
      const link = `https://card.oktech.jp#${id}`;
      try {
        const doc = await fetchDocument(id);
        const current = store.get();
        const isDirty = current.draft
          ? !deepEqual(current.draft, doc.data)
          : false;
        if (!isDirty && current.draft) {
          persistentDrafts.setKey(id, undefined);
        }
        persistentIds.setKey(id, true);
        store.set({
          ...current,
          saveDraft,
          discard,
          state: "ready",
          refresh,
          link,
          doc,
          isDirty,
        });
      } catch (err) {
        console.warn(err);
        const current = store.get();
        store.set({
          ...current,
          saveDraft,
          discard,
          state: "ready",
          link,
          refresh,
          doc: null,
          isDirty: !!current.draft,
        });
      }
    });
  };
  refresh();
  return listenKeys(persistentDrafts, [id], (drafts, _, ids) => {
    if (!ids.includes(id)) return;
    const draft = drafts[id];
    const current = store.get();
    if (current.state === "ready") {
      if (draft && current.doc && deepEqual(current.doc.data, draft)) {
        store.set({ ...current, draft: undefined, isDirty: false });
        persistentDrafts.setKey(id, undefined);
      } else if (draft) {
        store.set({ ...current, draft, isDirty: true });
      } else {
        store.set({ ...current, draft: undefined, isDirty: false });
      }
      return;
    }
    store.set({ ...current, draft });
  });
});
