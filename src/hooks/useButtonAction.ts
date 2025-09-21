import { useMemo, useRef, useState } from "react";

interface ButtonAction<T> {
  (): void;
  isRunning: boolean;
  lastRun?:
    | {
        time: number;
        success: true;
        data: T;
      }
    | {
        time: number;
        success: false;
        error: Error;
      };
}

export function useButtonAction<T>(handler: () => Promise<T>) {
  const handlerRef = useRef<() => Promise<T>>(handler);
  const [_, setLastChange] = useState<number>();
  return useMemo<ButtonAction<T>>(() => {
    const fn = (() => {
      if (fn.isRunning) return;
      fn.isRunning = true;
      setLastChange(Date.now());
      handlerRef
        .current()
        .then(
          (data) => {
            fn.lastRun = {
              success: true,
              time: Date.now(),
              data,
            };
          },
          (error) => {
            fn.lastRun = {
              success: false,
              time: Date.now(),
              error,
            };
          },
        )
        .finally(() => {
          fn.isRunning = false;
          setLastChange(Date.now());
        });
    }) as unknown as ButtonAction<T>;
    fn.isRunning = false;
    fn.lastRun = undefined;
    return fn;
  }, []);
}
