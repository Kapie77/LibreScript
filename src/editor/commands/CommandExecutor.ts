// CommandExecutor.ts
// src/editor/commands

import type { EditorCommand } from "./EditorCommands";
import { DocumentModel } from "../model/DocumentModel";
import type { ExecutedCommand } from "../history/ExecutedCommand";
// --------------------------------------------------------------------- //

export class CommandExecutor {

    private model: DocumentModel;

    constructor(

        model: DocumentModel

    ) {

        this.model = model;

    }

    execute(
        command: EditorCommand
    ): ExecutedCommand | null {

        switch (command.type) {

            // INSERT TEXT //
            case "INSERT_TEXT": {

                const paragraph =

                    this.model.getParagraphById(

                        command.paragraphId

                    );

                if (!paragraph) {

                    return null;

                }

                const previousContent =

                    paragraph.content;

                const newContent =

                    previousContent.slice(

                        0,

                        command.position

                    ) +

                    command.text +

                    previousContent.slice(

                        command.position

                    );

                this.model.updateParagraph(

                    command.paragraphId,

                    newContent

                );

                return {

                    command,

                    undoData: {

                        previousContent,

                        newContent,

                    },

                    caretBefore: {

                        paragraphId: command.paragraphId,
                        offset: command.position,

                    },

                    caretAfter: {

                        paragraphId: command.paragraphId,
                        offset: command.position + command.text.length,

                    },

                    timestamp: Date.now(),

                };

            }
            // ----------------------- //

            // UPDATE PARAGRAPH //
            case "UPDATE_PARAGRAPH": {

                const paragraph =

                    this.model.getParagraphById(

                        command.id

                    );

                const previousContent =

                    paragraph?.content ?? "";

                const newContent =

                    command.content;

                this.model.updateParagraph(

                    command.id,

                    newContent

                );

                return {

                    command,

                    undoData: {

                        previousContent,
                        newContent,

                    },

                    timestamp: 0,

                };

            }
            // -------- //


            // INSERT PARAGRAPH //
            case "INSERT_PARAGRAPH": {

                this.model.insertParagraph(

                    command.block,

                    command.index

                );

                break;

            }
            // -------- //


            // DELETE //
            case "DELETE_PARAGRAPH": {

                this.model.deleteParagraph(

                    command.id

                );

                break;

            }
            // -------- //

            // MOVE //
            case "MOVE_PARAGRAPH": {

                this.model.moveParagraph(

                    command.id,

                    command.newIndex

                );

                break;

            }
            // ------------ //

            // CHANGE //
            case "CHANGE_PARAGRAPH_TYPE": {

                this.model.changeParagraphType(

                    command.id,

                    command.blockType

                );

                break;

            }
            // ---------- //

            // LOAD DOCUMENT //
            case "LOAD_DOCUMENT": {

                this.model.load(

                    command.blocks

                );

                break;

            }
            // ---------------- //

            // SPLIT PARAGRAPH //
            case "SPLIT_PARAGRAPH": {

                const paragraph =

                    this.model.getParagraphById(

                        command.id

                    );

                if (!paragraph) {

                    return null;

                }

                const originalContent =

                    paragraph.content;

                const newParagraphId =

                    this.model.splitParagraph(

                        command.id,

                        command.offset

                    );

                if (newParagraphId === null) {

                    return null;

                }

                return {

                    command,

                    undoData: {

                        originalContent,

                        newParagraphId,

                    },

                    caretBefore: {

                        paragraphId: command.id,
                        offset: command.offset,

                    },

                    caretAfter: {

                        paragraphId: newParagraphId,
                        offset: 0,

                    },

                    timestamp: Date.now(),

                };

            }
            // --------------------- //

            // MERGE PREVIOUS //
            case "MERGE_PREVIOUS": {

                const current =

                    this.model.getParagraphById(

                        command.id

                    );

                if (!current) {

                    return null;

                }

                const paragraphs =

                    this.model.getParagraphs();

                const currentIndex =

                    paragraphs.findIndex(

                        paragraph => paragraph.id === command.id

                    );

                if (currentIndex <= 0) {

                    return null;

                }

                const previous =

                    paragraphs[currentIndex - 1];

                const previousContent =

                    previous.content;

                const currentContent =

                    current.content;

                const result =

                    this.model.mergeWithPrevious(

                        command.id

                    );

                if (!result) {

                    return null;

                }

                return {

                    command,

                    undoData: {

                        previousParagraphId: previous.id,

                        previousContent,

                        currentContent,

                        insertIndex: currentIndex,

                        paragraphType: current.type,

                    },

                    caretBefore: {

                        paragraphId: current.id,
                        offset: 0,

                    },

                    caretAfter: {

                        paragraphId: result.paragraphId,
                        offset: result.offset,

                    },

                    timestamp: Date.now(),

                };

            }

            // MERGE NEXT //
            case "MERGE_NEXT": {

                this.model.mergeWithNext(

                    command.id

                );

                return null;

            }
            // --------------------- //

            // DELETE TEXT //
            case "DELETE_TEXT": {

                const paragraph =

                    this.model.getParagraphById(

                        command.paragraphId

                    );

                if (!paragraph) {

                    return null;

                }

                const previousContent =

                    paragraph.content;

                const newContent =

                    previousContent.slice(

                        0,

                        command.position

                    ) +

                    previousContent.slice(

                        command.position +

                        command.deletedText.length

                    );

                this.model.updateParagraph(

                    command.paragraphId,

                    newContent

                );

                // variaveis
                const caretBefore =
                    command.direction === "backward"
                        ? {
                            paragraphId: command.paragraphId,
                            offset: command.position + command.deletedText.length,
                        }
                        : {
                            paragraphId: command.paragraphId,
                            offset: command.position,
                        };

                const caretAfter = {
                    paragraphId: command.paragraphId,
                    offset: command.position,
                };

                // --------- /

                return {

                    command,

                    undoData: {

                        previousContent,

                        newContent,

                    },

                    caretBefore,

                    caretAfter,

                    timestamp: 0,

                };

            }
            // ---------------------- //

            // REPLACE TEXT //
            case "REPLACE_TEXT": {
                const paragraph =

                    this.model.getParagraphById(

                        command.paragraphId

                    );

                if (!paragraph) {

                    return null;

                }

                const previousContent =

                    paragraph.content;

                const newContent =

                    previousContent.slice(

                        0,

                        command.position

                    ) +

                    command.insertedText +

                    previousContent.slice(

                        command.position +

                        command.removedText.length

                    );

                this.model.updateParagraph(

                    command.paragraphId,

                    newContent

                );

                return {

                    command,

                    undoData: {

                        previousContent,

                        newContent,

                    },

                    caretBefore: {

                        paragraphId: command.paragraphId,
                        offset: command.position + command.removedText.length,

                    },

                    caretAfter: {

                        paragraphId: command.paragraphId,
                        offset: command.position + command.insertedText.length,

                    },

                    timestamp: 0,

                };
            
            }
            // -------------------------- //

            // REPLACE SELECTION //
            case "REPLACE_SELECTION": {

                const { start, end } = command.selection;

                if (start.paragraphId !== end.paragraphId) {
                    return null;
                }

                const paragraph =
                    this.model.getParagraphById(start.paragraphId);

                if (!paragraph) {
                    return null;
                }

                const previousContent = paragraph.content;

                const newContent =
                    previousContent.slice(0, start.offset) +
                    command.text +
                    previousContent.slice(end.offset);

                this.model.updateParagraph(
                    start.paragraphId,
                    newContent
                );

                return {

                    command,

                    undoData: {
                        previousContent,
                        newContent,
                    },

                    selectionAfter: {
                        anchorParagraphId: start.paragraphId,
                        anchorOffset: start.offset + command.text.length,

                        focusParagraphId: start.paragraphId,
                        focusOffset: start.offset + command.text.length,
                    },

                    caretAfter: {
                        paragraphId: start.paragraphId,
                        offset: start.offset + command.text.length,
                    },

                    timestamp: Date.now(),

                };

            }
            // ---------------------------- //

            // REPLACE_SELECTION_MULTI //
            case "REPLACE_SELECTION_MULTI": {

                const multi =
                    command.multiSelection;

                const first =
                    multi.paragraphs[0];

                const last =
                    multi.paragraphs[
                        multi.paragraphs.length - 1
                    ];

                const firstParagraph =
                    this.model.getParagraphById(first.id);

                const paragraphs = this.model.getParagraphs();

                const insertIndex =
                    paragraphs.findIndex(

                        p => p.id === first.id

                    );

                if (!firstParagraph) {

                    return null;

                }

                const mergedContent =

                    first.content.slice(
                        0,
                        multi.startOffset
                    ) +

                    command.text +

                    last.content.slice(
                        multi.endOffset
                    );

                console.log("MERGED CONTENT:");
                console.log(mergedContent);

                const previousParagraphs = multi.paragraphs.map(p => ({

                    id: p.id,

                    type: this.model.getParagraphById(p.id)?.type ?? "action",

                    content: p.content,

                }));

                this.model.updateParagraph(

                    first.id,

                    mergedContent

                );

                // remove todos os parágrafos após o primeiro
                for (

                    let i = multi.paragraphs.length - 1;

                    i >= 1;

                    i--

                ) {

                    this.model.deleteParagraph(

                        multi.paragraphs[i].id

                    );

                }

                return {

                    command,

                    undoData: {

                        previousParagraphs,

                        insertIndex,

                    },

                    selectionBefore:

                        command.selectionSnapshot,

                    caretAfter: {

                        paragraphId: first.id,

                        offset:

                            multi.startOffset +

                            command.text.length,

                    },

                    timestamp: 0,

                };

            }
            // ------------------------ //

        }
    
    return null;

    }

}