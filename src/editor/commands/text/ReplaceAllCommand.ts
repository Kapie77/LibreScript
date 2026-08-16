// ReplaceAllCommand.ts
// src/editor/commands/text/ReplaceAllCommand.ts

import type { ScriptBlock } from "../../../types/script";

export interface ReplaceAllCommand {

    type: "REPLACE_ALL";
    term: string;
    replacement: string;
    caseSensitive: boolean;
    ignoreAccents: boolean;

}