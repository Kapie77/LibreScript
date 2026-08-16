// CommandExecutor.ts
// src/editor/commands/

import type { EditorCommand } from "./EditorCommands";
import { DocumentModel } from "../model/DocumentModel";
import type { ExecutedCommand } from "../history/ExecutedCommand";

import type { InsertTextCommand } from "./text/InsertTextCommand";
import type { DeleteTextCommand } from "./text/DeleteTextCommand";
import type { ReplaceTextCommand } from "./text/ReplaceTextCommand";
import type { ReplaceSelectionCommand } from "./text/ReplaceSelectionCommand";
import type { ReplaceSelectionMultiCommand } from "./text/ReplaceSelectionMultiCommand";

import type { 
    MergeNextCommand, 
    MergePreviousCommand,
    DeleteParagraphCommand, 
    SplitParagraphCommand
} from "./EditorCommands";
import type { PasteMultiParagraphCommand } from "./text/PasteMultiParagraphCommand";

import type { ReplaceAllCommand } from "./text/ReplaceAllCommand";
// --------------------------------------------------------------------- //

export class CommandExecutor {

    private model: DocumentModel;

    constructor(

        model: DocumentModel

    ) {

        this.model = model;

    }

// =======================================================
// APPLY COMMANDS
// =======================================================

// applyInsertText
public applyInsertText(

    command: InsertTextCommand

) {

    return this.model.insertText(

        command.paragraphId,
        command.position,
        command.text

    );

}

// applyDeleteText //
public applyDeleteText(

    command: DeleteTextCommand

) {

    return this.model.deleteText(

        command.paragraphId,
        command.position,
        command.deletedText

    );

}

// applyDeleteParagraph //
public applyDeleteParagraph(

    command: DeleteParagraphCommand

) {

    return this.model.deleteParagraph(

        command.id

    );

}

// applyReplaceText
public applyReplaceText(

    command: ReplaceTextCommand

) {

    return this.model.replaceText(

        command.paragraphId,
        command.position,
        command.removedText,
        command.insertedText

    );

}

// applyReplaceAll
public applyReplaceAll(

    command: ReplaceAllCommand

) {

    return this.model.replaceAll(

        command.term,
        command.replacement,
        command.caseSensitive,
        command.ignoreAccents

    );

}

// applyReplaceSelection //
public applyReplaceSelection(

    command: ReplaceSelectionCommand

) {

    return this.model.replaceSelection(

        command.selection,
        command.text

    );

}

// applyReplaceSelection //
public applyReplaceSelectionMulti(

    command: ReplaceSelectionMultiCommand

) {

    return this.model.replaceSelectionMulti(

        command.multiSelection,

        command.text

    );

}

// applyMergeNext //
public applyMergeNext(

    command: MergeNextCommand

) {

    return this.model.mergeNext(

        command.id

    );

}

// applyMergePrevious //
public applyMergePrevious(

    command: MergePreviousCommand

) {

    return this.model.mergePrevious(

        command.id

    );

}

// applySplitParagraph //
public applySplitParagraph(

    command: SplitParagraphCommand,

    forcedId?: number

) {

    return this.model.splitParagraphWithUndo(

        command.id,

        command.offset,

        forcedId

    );

}

// applyPasteMultiParagraph //
public applyPasteMultiParagraph(
    command: PasteMultiParagraphCommand
) {

    return this.model.pasteParagraphs(

        command.paragraphId,
        command.position,
        command.text

    );

}
// =======================================================
    execute(
        command: EditorCommand
    ): ExecutedCommand | null {

        switch (command.type) {

            case "INSERT_TEXT": {

                const result =

                    this.applyInsertText(

                        command

                    );

                if (!result) {

                    return null;

                }

                return {

                    command,

                    undoData: {

                        previousContent:

                            result.previousContent,

                        newContent:

                            result.newContent,

                    },

                    caretBefore: {

                        paragraphId:

                            command.paragraphId,

                        offset:

                            command.position,

                    },

                    caretAfter:

                        result.caret,

                    timestamp:

                        Date.now(),

                };

            }
            // ----------------------- //

            // UPDATE PARAGRAPH //
            case "UPDATE_PARAGRAPH": {

                const result =
                    this.model.updateParagraphContent(

                        command.id,

                        command.content

                    );

                if (!result) {

                    return null;

                }

                return {

                    command,

                    undoData: {

                        previousContent:
                            result.previousContent,

                        newContent:
                            result.newContent,

                    },

                    timestamp:
                        Date.now(),

                };

            }
            // -------- //


            // INSERT PARAGRAPH //
            case "INSERT_PARAGRAPH": {

                this.model.insertParagraph(
                    command.block,
                    command.index
                );

                return {

                    command,

                    undoData: {

                        block:
                            command.block,

                        index:
                            command.index,

                    },

                    caretAfter: {

                        paragraphId:
                            command.block.id,

                        offset:
                            command.block.content.length,

                    },

                    timestamp:
                        Date.now(),

                };

            }
            // -------- //

            // PASTE MULTI PARAGRAPH //
            case "PASTE_MULTI_PARAGRAPH": {

                const result =
                    this.model.pasteParagraphs(
                        command.paragraphId,
                        command.position,
                        command.text
                    );

                if (!result) {
                    return null;
                }

                return {

                    command,

                    undoData: {

                        previousParagraphs:
                            result.previousParagraphs,

                        insertIndex:
                            result.insertIndex,

                        createdParagraphIds:
                            result.createdParagraphIds,

                    },

                    caretAfter:
                        result.caret,

                    timestamp:
                        Date.now(),

                };

            }
            // ---------------------- //


            // DELETE //
            case "DELETE_PARAGRAPH": {

                const blocks =
                    this.model.getBlocks();

                const index =
                    blocks.findIndex(
                        block => block.id === command.id
                    );

                if (index === -1) {

                    return null;

                }

                const block =
                    blocks[index];

                const deleted =
                    this.model.deleteParagraph(
                        command.id
                    );

                if (!deleted) {

                    return null;

                }

                // -------------------------------------------------
                // DEFINE PARA ONDE O CARET VAI APÓS O DELETE
                // -------------------------------------------------

                let caretAfter;

                // Se existe um bloco depois,
                // vai para o início dele.
                if (index < blocks.length - 1) {

                    const nextBlock =
                        blocks[index + 1];

                    caretAfter = {

                        paragraphId:
                            nextBlock.id,

                        offset: 0,

                    };

                }

                // Se era o último bloco,
                // vai para o final do bloco anterior.
                else if (index > 0) {

                    const previousBlock =
                        blocks[index - 1];

                    caretAfter = {

                        paragraphId:
                            previousBlock.id,

                        offset:
                            previousBlock.content.length,

                    };

                }

                return {

                    command,

                    undoData: {

                        block,
                        index,

                    },

                    caretAfter,

                    timestamp:
                        Date.now(),

                };

            }
            // -------- //

            // MOVE PARAGRAPH //
            case "MOVE_PARAGRAPH": {

                const blocks =
                    this.model.getBlocks();

                const previousIndex =
                    blocks.findIndex(
                        block => block.id === command.id
                    );

                if (previousIndex === -1) {

                    return null;

                }

                const moved =
                    this.model.moveParagraph(

                        command.id,

                        command.newIndex

                    );

                if (!moved) {

                    return null;

                }

                return {

                    command,

                    undoData: {

                        previousIndex,

                        newIndex:
                            command.newIndex,

                    },

                    timestamp:
                        Date.now(),

                };

            }
            // ------------ //

            // CHANGE PARAGRAPH TYPE //
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

                const result =

                    this.applySplitParagraph(

                        command

                    );

                if (!result) {

                    return null;

                }

                return {

                    command,

                    undoData: {

                        originalContent:

                            result.originalContent,

                        newParagraphId:

                            result.newParagraphId,

                    },

                    caretBefore: {

                        paragraphId:

                            command.id,

                        offset:

                            command.offset,

                    },

                    caretAfter:

                        result.caret,

                    timestamp:

                        Date.now(),

                };

            }
            // --------------------- //

            // MERGE PREVIOUS //
            case "MERGE_PREVIOUS": {

                const result =

                    this.applyMergePrevious(

                        command

                    );

                if (!result) {

                    return null;

                }

                return {

                    command,

                    undoData: {

                        currentParagraphId:

                            result.currentParagraphId,

                        previousParagraphId:

                            result.previousParagraphId,

                        previousContent:

                            result.previousContent,

                        currentContent:

                            result.currentContent,

                        insertIndex:

                            result.insertIndex,

                        paragraphType:

                            result.paragraphType,

                    },

                    caretAfter:

                        result.caret,

                    timestamp:

                        Date.now(),

                };

            }
            // MERGE NEXT //
            case "MERGE_NEXT": {

                const result =

                    this.applyMergeNext(

                        command

                    );

                if (!result) {

                    return null;

                }

                return {

                    command,

                    undoData: {

                        currentParagraphId:

                            result.currentParagraphId,

                        currentContent:

                            result.currentContent,

                        nextParagraph:

                            result.nextParagraph,

                        insertIndex:

                            result.insertIndex,

                        paragraphType:

                            result.paragraphType,

                    },

                    caretAfter:

                        result.caretAfter,

                    timestamp:

                        Date.now(),

                };

            }
            // --------------------- //

            // DELETE TEXT //
            case "DELETE_TEXT": {

                const result =

                    this.applyDeleteText(

                        command

                    );

                if (!result) {

                    return null;

                }

                const caretBefore =

                    command.direction === "backward"

                        ? {

                            paragraphId:

                                command.paragraphId,

                            offset:

                                command.position +

                                command.deletedText.length,

                        }

                        : {

                            paragraphId:

                                command.paragraphId,

                            offset:

                                command.position,

                        };

                return {

                    command,

                    undoData: {

                        previousContent:

                            result.previousContent,

                        newContent:

                            result.newContent,

                    },

                    caretBefore,

                    caretAfter:

                        result.caretAfter,

                    timestamp:

                        Date.now(),

                };

            }
            // ---------------------- //

            // REPLACE TEXT //
            case "REPLACE_TEXT": {

                const result =

                    this.applyReplaceText(

                        command

                    );

                if (!result) {

                    return null;

                }

                return {

                    command,

                    undoData: {

                        previousContent:

                            result.previousContent,

                        newContent:

                            result.newContent,

                    },

                    caretAfter:

                        result.caretAfter,

                    timestamp:

                        Date.now(),

                };

            }
            // -------------------------- //

            // REPLACE ALL //
            case "REPLACE_ALL": {

                const result =
                    this.applyReplaceAll(
                        command
                    );

                if (!result) {

                    return null;

                }

                return {

                    command,

                    undoData: {

                        previousParagraphs:
                            result.previousParagraphs,

                    },

                    timestamp:
                        Date.now(),

                };

            }
            // ---------------- //

            // REPLACE SELECTION //
            case "REPLACE_SELECTION": {

                const result =

                    this.applyReplaceSelection(

                        command

                    );

                if (!result) {

                    return null;

                }

                return {

                    command,

                    undoData: {

                        previousContent:

                            result.previousContent,

                        newContent:

                            result.newContent,

                    },

                    selectionAfter:

                        result.selectionAfter,

                    caretAfter:

                        result.caretAfter,

                    timestamp:

                        Date.now(),

                };

            }
            // ---------------------------- //

            // REPLACE_SELECTION_MULTI //
            case "REPLACE_SELECTION_MULTI": {

                const result =

                    this.applyReplaceSelectionMulti(

                        command

                    );

                if (!result) {

                    return null;

                }

                return {

                    command,

                    undoData: {

                        previousParagraphs:

                            result.previousParagraphs,

                        insertIndex:

                            result.insertIndex,

                    },

                    selectionBefore:

                        command.selectionSnapshot,

                    caretAfter:

                        result.caret,

                    timestamp:

                        Date.now(),

                };

            }
            // ------------------------ //

        }
        
    
    return null;

    }

}