// PasteMultiParagraphCommand.ts
// src/editor/commands/text/

import type { SelectionSnapshot } from "../../history/UndoData";

export interface PasteMultiParagraphCommand {

    type: "PASTE_MULTI_PARAGRAPH";

    paragraphId: number;

    position: number;

    text: string;

    selectionSnapshot?: SelectionSnapshot;

}