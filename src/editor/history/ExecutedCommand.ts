// ExecutedCommand.ts
// src/editor/history/
import type { EditorCommand } from "../commands/EditorCommands";
import type {
    CaretSnapshot,
    SelectionSnapshot,
    ContentUndoData,
    SplitParagraphUndoData,
    MergeParagraphUndoData,
    ReplaceSelectionMultiUndoData,
    PasteMultiParagraphUndoData,
    InsertParagraphUndoData,
    ChangeParagraphTypeUndoData,
    MoveParagraphUndoData,
    DeleteParagraphUndoData,
    ReplaceAllUndoData,
} from "./UndoData";
// ------------------------------------------------------------------- //
export interface ExecutedCommand {

    command: EditorCommand;

    undoData:
        | ContentUndoData
        | SplitParagraphUndoData
        | MergeParagraphUndoData
        | ReplaceSelectionMultiUndoData
        | PasteMultiParagraphUndoData
        | InsertParagraphUndoData
        | ChangeParagraphTypeUndoData
        | MoveParagraphUndoData
        | DeleteParagraphUndoData
        | ReplaceAllUndoData;

    selectionBefore?: SelectionSnapshot;
    selectionAfter?: SelectionSnapshot;

    caretBefore?: CaretSnapshot;
    caretAfter?: CaretSnapshot;

    timestamp: number;

}