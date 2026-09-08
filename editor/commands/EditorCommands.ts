// EditorCommands.ts (comandos do editor)
// src/editor/commands/
import type { BlockType, ScriptBlock, ParagraphAlignment } from "../../types/script";
import type { InsertTextCommand } from "./text/InsertTextCommand";
import type { DeleteTextCommand } from "./text/DeleteTextCommand";
import type { ReplaceSelectionCommand } from "./text/ReplaceSelectionCommand";

import type { ReplaceSelectionMultiCommand } from "./text/ReplaceSelectionMultiCommand";
import type { PasteMultiParagraphCommand } from "./text/PasteMultiParagraphCommand";

import type { ReplaceAllCommand } from "./text/ReplaceAllCommand";

import type { SelectionSnapshot } from "../history/UndoData";
// -------------------------------------------------------------------- //

export interface InsertParagraphCommand {

    type: "INSERT_PARAGRAPH";
    block: ScriptBlock;
    index: number;

}

export interface DeleteParagraphCommand {

    type: "DELETE_PARAGRAPH";
    id: number;

}

export interface UpdateParagraphCommand {

    type: "UPDATE_PARAGRAPH";
    id: number;
    content: string;

}

export interface SplitParagraphCommand {

    type: "SPLIT_PARAGRAPH";
    id: number;
    offset: number;

}

export interface MoveParagraphCommand {

    type: "MOVE_PARAGRAPH";
    id: number;
    newIndex: number;

}

export interface LoadDocumentCommand {

    type: "LOAD_DOCUMENT";
    blocks: ScriptBlock[];

}

export interface MergePreviousCommand {

    type: "MERGE_PREVIOUS";
    id: number;

}

export interface MergeNextCommand {

    type: "MERGE_NEXT";
    id: number;

}

export interface ReplaceTextCommand {

    type: "REPLACE_TEXT";
    paragraphId: number;
    position: number;
    removedText: string;
    insertedText: string;

}

export interface ToggleBoldCommand {

    type: "TOGGLE_BOLD";

    selection: {
        anchorParagraphId: number;
        anchorOffset: number;
        focusParagraphId: number;
        focusOffset: number;
    };

}

export interface ToggleItalicCommand {
    type: "TOGGLE_ITALIC";
    selection: {
        anchorParagraphId: number;
        anchorOffset: number;
        focusParagraphId: number;
        focusOffset: number;
    };
}

export interface ToggleUnderlineCommand {
    type: "TOGGLE_UNDERLINE";
    selection: {
        anchorParagraphId: number;
        anchorOffset: number;
        focusParagraphId: number;
        focusOffset: number;
    };
}

export interface ToggleStrikeCommand {
    type: "TOGGLE_STRIKE";
    selection: {
        anchorParagraphId: number;
        anchorOffset: number;
        focusParagraphId: number;
        focusOffset: number;
    };
}

export interface SetParagraphAlignmentCommand {
    type: "SET_PARAGRAPH_ALIGNMENT";
    paragraphId: number;
    alignment: ParagraphAlignment;
    selection: SelectionSnapshot;
}

export interface LowercaseTextCommand {
    type: "LOWERCASE_TEXT";
    paragraphId: number;
    startOffset: number;
    endOffset: number;
}

export interface UppercaseTextCommand {
    type: "UPPERCASE_TEXT";
    paragraphId: number;
    startOffset: number;
    endOffset: number;
}

export interface ChangeBlockTypeCommand {
    type: "CHANGE_BLOCK_TYPE";
    paragraphId: number;
    blockType: BlockType;
    selection: SelectionSnapshot;
}

export type EditorCommand =

    | InsertParagraphCommand
    | DeleteParagraphCommand
    | UpdateParagraphCommand
    | MoveParagraphCommand
    | LoadDocumentCommand
    | SplitParagraphCommand
    | MergePreviousCommand
    | MergeNextCommand
    | InsertTextCommand
    | DeleteTextCommand
    | ReplaceTextCommand
    | ReplaceSelectionCommand
    | ReplaceSelectionMultiCommand
    | PasteMultiParagraphCommand
    | ReplaceAllCommand
    | ToggleBoldCommand
    | ToggleItalicCommand
    | ToggleUnderlineCommand
    | ToggleStrikeCommand
    | SetParagraphAlignmentCommand
    | LowercaseTextCommand
    | UppercaseTextCommand
    | ChangeBlockTypeCommand;