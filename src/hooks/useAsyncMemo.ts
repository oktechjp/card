import { useEffect, useRef, useState, type DependencyList } from "react";

export type AsyncMemoLoadingState<T> = {
  state: "loading";
  error?: Error;
  loading: true;
  data?: T;
};
export type AsyncMemoSuccessState<T> = {
  state: "success";
  loading: false;
  error: undefined;
  data: T;
};
export type AsyncMemoErrorState<T> = {
  state: "error";
  error: Error;
  loading: false;
  data?: T;
};
export type AsyncMemoState<T> =
  | AsyncMemoLoadingState<T>
  | AsyncMemoSuccessState<T>
  | AsyncMemoErrorState<T>;

export function useAsyncMemo<T>(
  handler: () => Promise<T>,
  deps: DependencyList,
): AsyncMemoState<T> {
  const state = useRef<AsyncMemoState<T>>({
    state: "loading",
    loading: true,
  });
  const [_, setUpdate] = useState<number>(Date.now());
  useEffect(() => {
    let isActive = true;
    state.current = {
      state: "loading",
      loading: true,
      data: state.current.data,
      error: "error" in state.current ? state.current.error : undefined,
    };
    setUpdate(Date.now());
    handler()
      .then(
        (data) => {
          if (!isActive) return;
          state.current = {
            state: "success",
            loading: false,
            data,
            error: undefined,
          };
        },
        (error) => {
          if (!isActive) return;
          console.warn(error);
          state.current = {
            state: "error",
            loading: false,
            error,
          };
        },
      )
      .finally(() => isActive && setUpdate(Date.now()));
    return () => {
      isActive = false;
    };
  }, deps);
  return state.current;
}
