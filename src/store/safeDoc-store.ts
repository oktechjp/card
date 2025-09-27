import type { input, output } from "zod/v4";
import {
  createDocCodec,
  fetchDocument,
  getPossibleDocKey,
  type Codec,
  type DocCodec,
  type DocTypeDefinition,
  type WorkDocument,
} from "@/utils/safeDoc";
import deepEqual from "fast-deep-equal";
import { computed, listenKeys, mapCreator, task } from "nanostores";
import { persistentMap } from "@nanostores/persistent";

export function isReadyState(state: DocState): state is DocStateReady {
  return state.state === "ready";
}

export type DocStateNoDoc = {
  state: "no-doc";
  docKey: null;
  isValid: false;
};

export type DocStatePending = {
  state: "pending";
  docKey: string;
  isValid: true;
  refresh(): void;
};

export type DocStateNotStored = {
  state: "no-stored";
  docKey: string;
  isValid: true;
  refresh(): void;
};

export interface DocNotFound {
  docTime: undefined;
  doc: undefined;
  error?: Error;
}

export interface DraftFound<T extends DocTypeDefinition = DocTypeDefinition> {
  draft: output<T["schema"]>;
  isDirty: true;
}

export interface DraftNotFound {
  draft: undefined;
  isDirty: false;
}

export interface DocStateReady<
  T extends DocTypeDefinition = DocTypeDefinition,
> {
  state: "ready";
  docKey: string;
  isValid: true;
  type: T;
  saveDraft(type: T, data: input<T["schema"]>): void;
  refresh(): void;
  discard(): boolean;
  doc?: WorkDocument;
  draft?: WorkDocument;
  error?: Error;
}

export type DocState =
  | DocStateNoDoc
  | DocStatePending
  | DocStateReady
  | DocStateNotStored;

const BooleanCodec = {
  encode: (bool) => (bool ? "1" : "0"),
  decode: (str) => str === "1",
} satisfies Codec<boolean, string>;

const JsonCodec = {
  encode: JSON.stringify,
  decode: JSON.parse,
} satisfies Codec<any, string>;

const persistentIds = persistentMap<Record<string, boolean>>(
  "ids",
  {},
  BooleanCodec,
);

const persistentDrafts = persistentMap<Record<string, any>>(
  "drafts",
  {},
  JsonCodec,
);

export function createDoc(type: DocTypeDefinition, docKey: string) {
  persistentIds.setKey(docKey, true);
  persistentDrafts.setKey(docKey, {
    docKey,
    type: type.type,
    version: type.version,
    data: type.schema.parse({}),
  });
  return docKey;
}

export const knownDraftIds = computed([persistentDrafts], (all) =>
  Object.keys(all),
);
export const visitedDocIds = computed(persistentIds, (all) => Object.keys(all));

export type DocStore = ReturnType<typeof createDocStore>;

function loadDraft(
  docKey: string,
  defaultType: DocTypeDefinition,
  codec: DocCodec,
  map: Record<string, any>,
): WorkDocument<DocTypeDefinition> | undefined {
  const draftData = map[docKey];
  try {
    return draftData ? codec.decode(draftData) : undefined;
  } catch (err) {
    // TODO: this is a fallback, preferably removed after Nov. 2025
    return {
      docKey,
      type: defaultType,
      data: defaultType.schema.parse(draftData),
      time: new Date(),
    };
  }
}

const toError = (err: unknown) =>
  err instanceof Error ? err : new Error(String(err));

export const createDocStore = (
  types: DocTypeDefinition[],
  defaultType: DocTypeDefinition,
) => {
  const codec = createDocCodec(types);
  return mapCreator<DocState>((store, input) => {
    const docKey = getPossibleDocKey(input);
    const id = docKey ?? input;
    if (!docKey) {
      store.set({ id, state: "no-doc", isValid: false, docKey: null });
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
    const saveDraft = <T extends DocTypeDefinition>(
      type: T,
      newDraft: input<DocTypeDefinition>,
    ) => {
      persistentDrafts.setKey(
        id,
        codec.encode({
          docKey,
          type: type,
          time: new Date(),
          data: type.schema.parse(newDraft),
        }),
      );
    };
    const refresh = () => {
      task(async () => {
        const state: Omit<DocStateReady & { id: string }, "type"> = {
          id: input,
          state: "ready",
          isValid: true,
          docKey,
          saveDraft,
          discard,
          refresh,
        };
        try {
          state.doc = await fetchDocument(id, codec);
        } catch (err) {
          state.error = toError(err);
        }
        try {
          state.draft = loadDraft(
            docKey,
            defaultType,
            codec,
            persistentDrafts.get(),
          );
        } catch (err) {
          state.error = state.error ?? toError(err);
        }
        const type = state.doc?.type ?? state.draft?.type;
        if (!type) {
          store.set({
            id,
            state: "no-stored",
            docKey,
            isValid: true,
            refresh,
          });
          return;
        }
        if (
          state.doc &&
          state.draft &&
          state.doc.type === state.draft.type &&
          deepEqual(state.doc.data, state.draft.data)
        ) {
          state.draft = undefined;
          persistentDrafts.setKey(id, undefined);
        }
        persistentIds.setKey(id, true);
        store.set({
          ...state,
          type,
        });
      });
    };
    refresh();
    store.set({ id, state: "pending", isValid: true, docKey, refresh });
    return listenKeys(persistentDrafts, [id], (drafts, _, ids) => {
      if (!ids.includes(id)) return;
      const current = store.get();
      if (current.state !== "ready") {
        return;
      }
      let draft: WorkDocument | undefined;
      try {
        draft = loadDraft(docKey, defaultType, codec, drafts);
      } catch (err) {
        store.set({ ...current, error: toError(err) });
        return;
      }
      if (draft && current.doc && deepEqual(current.doc.data, draft)) {
        store.set({ ...current, draft: undefined });
        persistentDrafts.setKey(id, undefined);
      } else if (draft) {
        store.set({ ...current, draft });
      } else {
        store.set({ ...current, draft: undefined });
      }
      return;
    });
  });
};
