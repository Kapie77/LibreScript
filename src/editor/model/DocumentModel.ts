// DocumentModel.ts
// src/editor/model/
import type { ScriptBlock } from "../../types/script";
import { Document } from "../document/Document";
import { Paragraph } from "../document/Paragraph";
import type { CaretSnapshot, SelectionSnapshot } from "../history/UndoData";
import type { ReplaceSelectionMultiCommand } from "../commands/text/ReplaceSelectionMultiCommand";

import { SearchService } from "../services/SearchService";
// ----------------------------------------------------- //

export class DocumentModel {


    private document = new Document();
    private search = new SearchService();

    load(
        blocks: ScriptBlock[]
    ) {

        this.document.load(blocks);

    }

    getDocument() {

        return this.document;

    }

    getParagraphs(): Paragraph[] {

        return this.document.getParagraphs();

    }

    getParagraphById(

        id: number

    ): Paragraph | null {

        return this.document.getParagraphById(

            id

        );

    }

    findParagraph(
        id: number
    ) {

        return this.document.findParagraph(id);

    }

    getBlocks(): ScriptBlock[] {

        return this.document
            .toScriptBlocks();

    }

    updateParagraph(

        id: number,

        content: string

    ): boolean {

        return this.document.updateParagraph(

            id,

            content

        );

    }

    insertParagraph(

        block: ScriptBlock,

        index: number

    ): boolean {

        return this.document.insertParagraph(

            block,

            index

        );

    }

    deleteParagraph(

        id: number

    ): boolean {

        return this.document.deleteParagraph(

            id

        );

    }

    moveParagraph(

        id: number,

        newIndex: number

    ): boolean {

        return this.document.moveParagraph(

            id,

            newIndex

        );

    }

    changeParagraphType(

        id: number,

        type: ScriptBlock["type"]

    ): boolean {

        return this.document.changeParagraphType(

            id,

            type

        );

    }

    splitParagraph(

        id: number,

        offset: number,

        forcedId?: number

    ): number | null {

        return this.document.splitParagraph(

            id,

            offset,

            forcedId

        );

    }

    mergeWithPrevious(

        id: number

    ) {

        return this.document.mergeWithPrevious(

            id

        );

    }

    mergeWithNext(

        id: number

    ) {

        return this.document.mergeWithNext(

            id

        );

    }

    // pasteParagraphs //
    public pasteParagraphs(
        paragraphId: number,
        position: number,
        text: string
    ): {

        previousParagraphs: ScriptBlock[];

        insertIndex: number;

        createdParagraphIds: number[];

        caret: {

            paragraphId: number;

            offset: number;

        };

    } | null {

        const lines =
            text.split("\n");

        const paragraph =
            this.getParagraphById(
                paragraphId
            );

        if (!paragraph) {

            return null;

        }

        const original =
            paragraph.content;

        const before =
            original.slice(
                0,
                position
            );

        const after =
            original.slice(
                position
            );

        const firstContent =
            before +
            lines[0];

        const current =
            this.getBlocks();

        const previousParagraphs =
            current.map(
                block => ({ ...block })
            );

        this.updateParagraph(
            paragraphId,
            firstContent
        );

        const index =
            current.findIndex(
                p => p.id === paragraphId
            );

        let insertIndex =
            index + 1;

        let lastParagraphId =
            paragraphId;

        const createdParagraphIds: number[] = [];

        for (
            let i = 1;
            i < lines.length;
            i++
        ) {

            const id =
                Date.now() + i;

            createdParagraphIds.push(id);

            lastParagraphId = id;

            this.insertParagraph(

                {

                    id,

                    type:
                        paragraph.type,

                    content:
                        i === lines.length - 1
                            ? lines[i] + after
                            : lines[i],

                },

                insertIndex

            );

            insertIndex++;

        }

        return {

            previousParagraphs,

            insertIndex:
                index + 1,

            createdParagraphIds,

            caret: {

                paragraphId:
                    lastParagraphId,

                offset:
                    lines[
                        lines.length - 1
                    ].length,

            },

        };

    }
    // ------------------- //

    // insertText //
    public insertText(

        paragraphId: number,
        position: number,
        text: string

    ): {

        previousContent: string;

        newContent: string;

        caret: {

            paragraphId: number;

            offset: number;

        };

    } | null {

        const paragraph =

            this.getParagraphById(

                paragraphId

            );

        if (!paragraph) {

            return null;

        }

        const previousContent =

            paragraph.content;

        const newContent =

            previousContent.slice(

                0,

                position

            ) +

            text +

            previousContent.slice(

                position

            );

        this.updateParagraph(

            paragraphId,

            newContent

        );

        return {

            previousContent,

            newContent,

            caret: {

                paragraphId,

                offset:

                    position +

                    text.length,

            },

        };

    }

    // deleteText //
    public deleteText(

        paragraphId: number,
        position: number,
        deletedText: string

    ): {

        previousContent: string;

        newContent: string;

        caretAfter: CaretSnapshot;

    } | null {

        const paragraph =

            this.getParagraphById(

                paragraphId

            );

        if (!paragraph) {

            return null;

        }

        const previousContent =

            paragraph.content;

        const newContent =

            previousContent.slice(

                0,

                position

            ) +

            previousContent.slice(

                position +

                deletedText.length

            );

        this.updateParagraph(

            paragraphId,

            newContent

        );

        return {

            previousContent,

            newContent,

            caretAfter: {

                paragraphId,

                offset: position,

            },

        };

    }

    // replaceText //
    public replaceText(

        paragraphId: number,
        position: number,
        removedText: string,
        insertedText: string

    ): {

        previousContent: string;

        newContent: string;

        caretAfter: CaretSnapshot;

    } | null {

        const paragraph =

            this.getParagraphById(

                paragraphId

            );

        if (!paragraph) {

            return null;

        }

        const previousContent =

            paragraph.content;

        const newContent =

            previousContent.slice(

                0,

                position

            ) +

            insertedText +

            previousContent.slice(

                position +

                removedText.length

            );

        this.updateParagraph(

            paragraphId,

            newContent

        );

        return {

            previousContent,

            newContent,

            caretAfter: {

                paragraphId,

                offset:

                    position +

                    insertedText.length,

            },

        };

    }

    // findOccurrences //
    public findOccurrences(
        text: string,
        term: string,
        caseSensitive: boolean = false,
        ignoreAccents: boolean = true
    ) {

        return this.search.findOccurrences(
            text,
            term,
            caseSensitive,
            ignoreAccents
        );

    }

    // replaceAll //
    public replaceAll(
        term: string,
        replacement: string,
        caseSensitive: boolean = false,
        ignoreAccents: boolean = true
    ): {
        previousParagraphs: ScriptBlock[];
    } | null {

        if (!term.trim()) {
            return null;
        }

        const previousParagraphs =
            this.getBlocks().map(block => ({
                ...block
            }));

        let changed = false;

        // -------------------------------------------------
        // PERCORRE TODOS OS PARÁGRAFOS
        // -------------------------------------------------

        for (const paragraph of this.getParagraphs()) {

            const occurrences =
                this.search.findOccurrences(
                    paragraph.content,
                    term,
                    caseSensitive,
                    ignoreAccents
                );

            if (occurrences.length === 0) {
                continue;
            }

            changed = true;

            let newContent =
                paragraph.content;

            // -------------------------------------------------
            // SUBSTITUI DE TRÁS PARA FRENTE
            // -------------------------------------------------

            for (
                let i = occurrences.length - 1;
                i >= 0;
                i--
            ) {

                const occurrence =
                    occurrences[i];

                newContent =
                    newContent.slice(
                        0,
                        occurrence.start
                    ) +

                    replacement +

                    newContent.slice(
                        occurrence.end
                    );

            }

            this.updateParagraph(
                paragraph.id,
                newContent
            );

        }

        if (!changed) {
            return null;
        }

        return {
            previousParagraphs
        };

    }

    // replaceSelection //
    public replaceSelection(

        selection: {

            start: {
                paragraphId: number;
                offset: number;
            };

            end: {
                paragraphId: number;
                offset: number;
            };

        },

        text: string

    ): {

        previousContent: string;

        newContent: string;

        caretAfter: CaretSnapshot;

        selectionAfter: SelectionSnapshot;

    } | null {

        const { start, end } = selection;

        if (

            start.paragraphId !==
            end.paragraphId

        ) {

            throw new Error(

                "ReplaceSelection recebeu seleção multi-parágrafo."

            );

        }

        const paragraph =

            this.getParagraphById(

                start.paragraphId

            );

        if (!paragraph) {

            return null;

        }

        const previousContent =

            paragraph.content;

        const newContent =

            previousContent.slice(

                0,

                start.offset

            ) +

            text +

            previousContent.slice(

                end.offset

            );

        this.updateParagraph(

            start.paragraphId,

            newContent

        );

        return {

            previousContent,

            newContent,

            caretAfter: {

                paragraphId:

                    start.paragraphId,

                offset:

                    start.offset +

                    text.length,

            },

            selectionAfter: {

                anchorParagraphId:

                    start.paragraphId,

                anchorOffset:

                    start.offset +

                    text.length,

                focusParagraphId:

                    start.paragraphId,

                focusOffset:

                    start.offset +

                    text.length,

            },

        };

    }

    // replaceSelectionMulti //
    public replaceSelectionMulti(

        multi: ReplaceSelectionMultiCommand["multiSelection"],

        text: string

    ): {

        previousParagraphs: ScriptBlock[];

        insertIndex: number;

        caret: {

            paragraphId: number;

            offset: number;

        };

    } | null {

        const first =

            multi.paragraphs[0];

        const last =

            multi.paragraphs[
                multi.paragraphs.length - 1
            ];

        const paragraphs =

            this.getParagraphs();

        const insertIndex =

            paragraphs.findIndex(

                p => p.id === first.id

            );

        const mergedContent =

            first.content.slice(

                0,

                multi.startOffset

            ) +

            text +

            last.content.slice(

                multi.endOffset

            );

        const previousParagraphs =

            multi.paragraphs.map(

                p => ({

                    id: p.id,

                    type:

                        this.getParagraphById(p.id)?.type ??

                        "action",

                    content:

                        p.content,

                })

            );

        this.updateParagraph(

            first.id,

            mergedContent

        );

        for (

            let i =

                multi.paragraphs.length - 1;

            i >= 1;

            i--

        ) {

            this.deleteParagraph(

                multi.paragraphs[i].id

            );

        }

        return {

            previousParagraphs,

            insertIndex,

            caret: {

                paragraphId:

                    first.id,

                offset:

                    multi.startOffset +

                    text.length,

            },

        };

    }

    // splitParagraphWithUndo //
    public splitParagraphWithUndo(

        id: number,

        offset: number,

        forcedId?: number

    ): {

        originalContent: string;

        newParagraphId: number;

        caret: {

            paragraphId: number;

            offset: number;

        };

    } | null {

        const paragraph =

            this.getParagraphById(id);

        if (!paragraph) {

            return null;

        }

        const originalContent =

            paragraph.content;

        const newParagraphId =

            this.splitParagraph(

                id,

                offset,

                forcedId

            );

        if (

            newParagraphId === null

        ) {

            return null;

        }

        return {

            originalContent,

            newParagraphId,

            caret: {

                paragraphId:

                    newParagraphId,

                offset: 0,

            },

        };

    }

    // mergePrevious //
    public mergePrevious(

        id: number

    ): {

        currentParagraphId: number;

        previousParagraphId: number;

        previousContent: string;

        currentContent: string;

        insertIndex: number;

        paragraphType: ScriptBlock["type"];

        caret: {

            paragraphId: number;

            offset: number;

        };

    } | null {

        const current =

            this.getParagraphById(id);

        if (!current) {

            return null;

        }

        const paragraphs =

            this.getParagraphs();

        const currentIndex =

            paragraphs.findIndex(

                p => p.id === id

            );

        if (

            currentIndex <= 0

        ) {

            return null;

        }

        const previous =

            paragraphs[currentIndex - 1];

        const previousContent =

            previous.content;

        const currentContent =

            current.content;

        const caret =

            this.mergeWithPrevious(id);

        if (!caret) {

            return null;

        }

        return {

            currentParagraphId:

                current.id,

            previousParagraphId:

                previous.id,

            previousContent,

            currentContent,

            insertIndex:

                currentIndex,

            paragraphType:

                current.type,

            caret,

        };

    }

    // mergeNext //
    mergeNext(
        paragraphId: number
    ): {
        currentParagraphId: number;
        currentContent: string;
        nextParagraph: ScriptBlock;
        insertIndex: number;
        paragraphType: ScriptBlock["type"];
        caretAfter: CaretSnapshot;
    } | null {

        const current =
            this.getParagraphById(paragraphId);

        if (!current) {

            return null;

        }

        const blocks =
            this.getBlocks();

        const index =
            blocks.findIndex(

                p => p.id === paragraphId

            );

        if (

            index === -1 ||

            index >= blocks.length - 1

        ) {

            return null;

        }

        const next =
            blocks[index + 1];

        const currentContent =
            current.content;

        const caretAfter =
            this.mergeWithNext(paragraphId);

        if (!caretAfter) {

            return null;

        }

        return {

            currentParagraphId:
                current.id,

            currentContent,

            nextParagraph:
                { ...next },

            insertIndex:
                index + 1,

            paragraphType:
                current.type,

            caretAfter

        };

    }

    // updateParagraphContent //
    public updateParagraphContent(
        id: number,
        content: string
    ): {
        previousContent: string;
        newContent: string;
    } | null {

        const paragraph =
            this.document.getParagraphById(id);

        if (!paragraph) {

            return null;

        }

        const previousContent =
            paragraph.content;

        this.document.updateParagraph(
            id,
            content
        );

        return {

            previousContent,
            newContent: content,

        };

    }

}