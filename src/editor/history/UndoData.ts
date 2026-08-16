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

export interface ContentUndoData { // antigo UpdateParagraphUndoData //

    previousContent: string;
    newContent: string;

}

export interface SplitParagraphUndoData {

    originalContent: string;
    newParagraphId: number;

}

export interface MergeParagraphUndoData {

    currentParagraphId: number;
    currentContent: string;
    previousParagraphId?: number;
    previousContent?: string;
    nextParagraph?: ScriptBlock;
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

export interface PasteMultiParagraphUndoData {

    previousParagraphs: ScriptBlock[];
    insertIndex: number;
    createdParagraphIds: number[];

}

export interface ChangeParagraphTypeUndoData {

    previousType: ScriptBlock["type"];
    newType: ScriptBlock["type"];

}

export interface InsertParagraphUndoData {

    block: ScriptBlock;
    index: number;

}

export interface MoveParagraphUndoData {

    previousIndex: number;
    newIndex: number;

}

export interface DeleteParagraphUndoData {

    block: ScriptBlock;
    index: number;

}

export interface ReplaceAllUndoData {

    previousParagraphs: ScriptBlock[];

}