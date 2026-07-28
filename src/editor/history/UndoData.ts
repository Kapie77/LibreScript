// UndoData.ts (arquivo com os tipos de seleção)
// src/editor/history/

import type { ScriptBlock } from "../../types/script";

export interface CaretSnapshot {

    paragraphId: number;
    offset: number;

}

export interface SelectionSnapshot {

    anchorParagraphId: number;
    anchorOffset: number;

    focusParagraphId: number;
    focusOffset: number;

}

export interface UpdateParagraphUndoData {

    previousContent: string;
    newContent: string;
    /*beforeCaret: CaretSnapshot;
    afterCaret: CaretSnapshot;*/

}

export interface SplitParagraphUndoData {

    originalContent: string;
    newParagraphId: number;

}

export interface MergeParagraphUndoData {

    previousParagraphId: number;
    previousContent: string;
    currentContent: string;
    insertIndex: number;
    paragraphType: ScriptBlock["type"];

}

export interface ReplaceSelectionMultiUndoData {

    previousParagraphs: ScriptBlock[];

    insertIndex: number;

}

export interface MultiParagraphSelection {

    startParagraphId: number;
    endParagraphId: number;
    startOffset: number;
    endOffset: number;
    paragraphs: {
        id: number;
        content: string;
    }[];

}