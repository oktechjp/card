import { passwordBase32 } from "@/utils/password-base32";
import { passwordWords } from "@/utils/password-dict-words";
import { passwordWordsBip39 } from "./password-dict-words-bip39";

import type { PasswordGenerator } from "./crypto";

export const passwordGenerators: PasswordGenerator[] = [
  passwordBase32,
  passwordWords,
  passwordWordsBip39,
];
