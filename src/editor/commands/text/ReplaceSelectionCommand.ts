// ReplaceSelectionCommand.ts
// src/editor/commands/text/
import type { OrderedSelectionRange } from "../../selection/SelectionRange";
import type { SelectionSnapshot } from "../../history/UndoData";

export interface ReplaceSelectionCommand {

    type: "REPLACE_SELECTION";

    selection: OrderedSelectionRange;

    selectionSnapshot: SelectionSnapshot;

    text: string;

}