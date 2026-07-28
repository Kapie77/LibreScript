// ExecutedCommand.ts
// src/editor/history/
import type { EditorCommand } from "../commands/EditorCommands";
import type {
    CaretSnapshot,
    SelectionSnapshot,
    UpdateParagraphUndoData,
    SplitParagraphUndoData,
    MergeParagraphUndoData,
    ReplaceSelectionMultiUndoData,
} from "./UndoData";

export interface ExecutedCommand {

    command: EditorCommand;

    undoData:
        | UpdateParagraphUndoData
        | SplitParagraphUndoData
        | MergeParagraphUndoData
        | ReplaceSelectionMultiUndoData;

    selectionBefore?: SelectionSnapshot;
    selectionAfter?: SelectionSnapshot;

    caretBefore?: CaretSnapshot;
    caretAfter?: CaretSnapshot;

    timestamp: number;

}