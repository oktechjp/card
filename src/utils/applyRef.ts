import type { Ref } from "react";

export function applyRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) {
    return;
  }
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}
