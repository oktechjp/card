import { passwordBase32 } from "@/utils/password-base32";
import { passwordWords } from "@/utils/password-dict-words";

export const passwordGenerators = [passwordBase32, passwordWords];
