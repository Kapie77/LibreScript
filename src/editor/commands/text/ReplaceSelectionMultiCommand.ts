// ReplaceSelectionMultiCommand.ts
// src/editor/commands/text/
import type { OrderedSelectionRange } from "../../selection/SelectionRange";
import type { SelectionSnapshot } from "../../history/UndoData";
import type {
    MultiParagraphSelection
} from "../../history/UndoData";
// ------------------------------------------------------------------------ //

export interface ReplaceSelectionMultiCommand {

    type: "REPLACE_SELECTION_MULTI";
    selection: OrderedSelectionRange;
    selectionSnapshot: SelectionSnapshot;
    text: string;
    multiSelection: MultiParagraphSelection;

}