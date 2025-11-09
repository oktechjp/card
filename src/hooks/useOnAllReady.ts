import { useMemo } from "react";

type AllReady<OnReady, T> = Array<
  OnReady extends Function
    ? (result: T) => void
    : OnReady extends null | undefined
      ? null
      : null | ((result: T) => null)
>;

export const useOnAllReady = <
  T = void,
  OnReady extends undefined | null | ((results?: T[]) => void) = undefined,
>(
  onReady: OnReady,
  length: number,
): AllReady<OnReady, T> =>
  useMemo(() => {
    if (!onReady) {
      return Array.from({ length }, () => null) as AllReady<OnReady, T>;
    }
    let count = 0;
    let results: Array<T> = new Array(length);
    return Array.from({ length }, (_, index) => {
      let called = false;
      return (result: T) => {
        if (called) return;
        called = true;
        results[index] = result;
        count += 1;
        if (count === length) {
          onReady(results);
        }
      };
    }) as AllReady<OnReady, T>;
  }, []);
