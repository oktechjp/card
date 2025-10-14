import { passwordBase32 } from "@/utils/password-base32";
import { passwordWords } from "@/utils/password-dict-words";
import type { PasswordGenerator } from "./crypto";

export const passwordGenerators: PasswordGenerator[] = [
  passwordBase32,
  passwordWords,
];
