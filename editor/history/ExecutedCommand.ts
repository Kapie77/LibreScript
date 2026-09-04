// ExecutedCommand.ts
// src/editor/history/
import type { EditorCommand } from "../commands/EditorCommands";
import type {
    CaretSnapshot,
    SelectionSnapshot,
    ContentUndoData,
    FormatRunsUndoData,
    SplitParagraphUndoData,
    MergeParagraphUndoData,
    ReplaceSelectionMultiUndoData,
    PasteMultiParagraphUndoData,
    InsertParagraphUndoData,
    ChangeParagraphTypeUndoData,
    MoveParagraphUndoData,
    DeleteParagraphUndoData,
    ReplaceAllUndoData,
    ParagraphAlignmentUndoData,
} from "./UndoData";
// ------------------------------------------------------------------- //
export interface ExecutedCommand {

    command: EditorCommand;

    undoData:
        | ContentUndoData
        | FormatRunsUndoData
        | SplitParagraphUndoData
        | MergeParagraphUndoData
        | ReplaceSelectionMultiUndoData
        | PasteMultiParagraphUndoData
        | InsertParagraphUndoData
        | ChangeParagraphTypeUndoData
        | MoveParagraphUndoData
        | DeleteParagraphUndoData
        | ReplaceAllUndoData
        | ParagraphAlignmentUndoData;

    selectionBefore?: SelectionSnapshot;
    selectionAfter?: SelectionSnapshot;

    caretBefore?: CaretSnapshot;
    caretAfter?: CaretSnapshot;

    timestamp: number;

}