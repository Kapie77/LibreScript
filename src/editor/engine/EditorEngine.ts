// EditorEngine.ts
// src/editor/engine/

import type { EditorCommand } from "../commands/EditorCommands";
import type { ScriptBlock } from "../../types/script";

import { DocumentModel } from "../model/DocumentModel";

import { CommandExecutor } from "../commands/CommandExecutor";
import { StatisticsService } from "../services/StatisticsService";
import { SearchService } from "../services/SearchService";
import { DocumentView } from "../view/DocumentView";

import { HistoryManager } from "../history/HistoryManager";
import type { EditorInput } from "../../types/EditorInput";

import type { InsertTextCommand } from "../commands/text/InsertTextCommand";
import { TextDiffService } from "../services/TextDiffService";
import type { DeleteTextCommand } from "../commands/text/DeleteTextCommand";
import type { ReplaceTextCommand } from "../commands/text/ReplaceTextCommand";
import type {
    UpdateParagraphUndoData,
    SplitParagraphUndoData,
    MergeParagraphUndoData,
    ReplaceSelectionMultiUndoData,
} from "../history/UndoData";
// --------------------------------------------------------------------- //
export class EditorEngine {

// =====================================================
// Dependencies
// =====================================================
    private root: HTMLDivElement | null = null;
    private documentView: DocumentView | null = null;
    private history = new HistoryManager();
    private document = new DocumentModel();
    private statistics = new StatisticsService();
    private search = new SearchService();
    private textDiff = new TextDiffService();

    private restoringHistory = false;

    private onDocumentChangedListeners:

        Array<(blocks: ScriptBlock[]) => void> = [];

    
    private notifyDocumentChanged() {

        const blocks =

            this.document.getBlocks();

        for (

            const listener of

            this.onDocumentChangedListeners

        ) {

            listener(blocks);

        }

    }
    
    private executor =

        new CommandExecutor(

            this.document

        );

// =====================================================
// Events
// =====================================================

    subscribeDocumentChanged(

        listener: (blocks: ScriptBlock[]) => void

    ) {

        this.onDocumentChangedListeners.push(

            listener

        );

        return () => {

            this.onDocumentChangedListeners =

                this.onDocumentChangedListeners.filter(

                    l => l !== listener

                );

        };

    }

// =====================================================
// Lifecycle
// =====================================================

    // attach //
    attach(root: HTMLDivElement) {

        if (this.documentView) {

            this.documentView.destroy();

        }

        this.root = root;

        this.documentView = new DocumentView(

            root,

            this

        );

    }

    // detach //
    detach() {

        this.documentView?.destroy();

        this.documentView = null;

        this.root = null;

    }


    // get root //
    getRoot() {

        return this.root;

    }

    // load document //
    loadDocument(

        blocks: ScriptBlock[]

    ) {

        this.document.load(

            blocks

        );

        this.render();
        this.notifyDocumentChanged();

    }

    // break history group
    breakHistoryGroup() {

        this.history.breakMergeGroup();

    }

// =====================================================
// Queries
// =====================================================
    // Get blocks
    getBlocks() {

        return this.document.getBlocks();

    }
    // ---------- //

    // get document //
    getDocument() {

        return this.document;

    }
    // --------------- //

    // get paragraph by id //
    getParagraphById(

        id: number

    ): HTMLParagraphElement | null {

        return this.documentView?.getParagraphById(id) ?? null;

    }
    // ----------------------- //

    // Updateblock //
    updateBlock(

        id: number,

        content: string

    ) {

        this.updateParagraph(

            id,

            content

        );

    }
    // ---------------- //

    // split paragraph
    splitParagraph(

        id: number,

        offset: number

    ): number | null {

        const newId =

            this.executor.execute({

                type: "SPLIT_PARAGRAPH",

                id,

                offset,

            }) as number | null;

        if (newId === null) {

            return null;

        }

        this.render();

        this.notifyDocumentChanged();

        return newId;

    }

    // render //
    render() {

        if (!this.documentView) {

            return;

        }

        this.documentView.render(

            this.getBlocks()

        );

    }
    // ------------------- //

    // Reload Document
    reloadDocument(

        blocks: ScriptBlock[]

    ) {

        this.executor.execute({

            type: "LOAD_DOCUMENT",

            blocks,

        });

        this.render();
        this.notifyDocumentChanged();

    }
    // -------------- //

    // Search //
    searchBlocks(

        term: string

    ): number[] {

        return this.search.search(

            this.getBlocks(),

            term

        );

    }
    // ----------------- //

    // merge with previous //
    mergeWithPrevious(

        id: number

    ) {

        const result =

            this.executor.execute({

                type: "MERGE_PREVIOUS",

                id,

            }) as {

                paragraphId: number;

                offset: number;

            } | null;

        if (!result) {

            return null;

        }

        this.render();

        this.notifyDocumentChanged();

        return result;

    }
    // ----------------------- //

    // merge with next //
    mergeWithNext(

        id: number

    ) {

        const result =

            this.executor.execute({

                type: "MERGE_NEXT",

                id,

            }) as {

                paragraphId: number;

                offset: number;

            } | null;

        if (!result) {

            return null;

        }

        this.render();

        this.notifyDocumentChanged();

        return result;

    }
    // -------------------------- //

// =====================================================
// Commands
// =====================================================

    // executor command
    execute(command: EditorCommand) {

        if (this.restoringHistory) {

            return;

        }

        // salva posição do cursor antes da execução
        const selectionBefore = this.documentView?.saveSelection();
        const beforeCaret = this.documentView?.saveCaret();

        const executed = this.executor.execute(command);

        if (!executed) {
            return;
        }

        // se o CommandExecutor não definiu o beforeCaret,
        // usa o caret atual
        if (!executed.selectionBefore) {
            executed.selectionBefore = selectionBefore;
        }

        if (!executed.caretBefore) {
            executed.caretBefore = beforeCaret;
        }

        this.render();

        // se o CommandExecutor definiu um afterCaret,
        // restaura exatamente essa posição
        if (executed.selectionAfter) {

            this.documentView?.restoreSelection(
                executed.selectionAfter
            );

        } else if (executed.caretAfter) {

            this.documentView?.restoreCaret(
                executed.caretAfter
            );

        }

        executed.timestamp = Date.now();

        this.history.push(executed);

        this.notifyDocumentChanged();

    }
    // -------------------- //

    // Insert Paragraph //
    insertParagraph(
        block: ScriptBlock,
        index: number
    ) {

        this.execute({
            type: "INSERT_PARAGRAPH",
            block,
            index,
        });

    }
    // ------------------- //

    // Delete Paragraph //
    deleteParagraph(

        id: number

    ) {

        this.execute({

            type: "DELETE_PARAGRAPH",

            id,

        });

    }
    // --------------- //

    // Move Paragraph //
    moveParagraph(

        id: number,

        newIndex: number

    ) {

        this.execute({

            type: "MOVE_PARAGRAPH",

            id,

            newIndex,

        });

    }

        // Move Paragraph Up //
        moveParagraphUp(

            id: number

        ) {

            const index = this.document
                .getBlocks()
                .findIndex(block => block.id === id);

            if (index <= 0) {

                return;

            }

            this.moveParagraph(

                id,

                index - 1

            );

        }
        // ----------------- //


        // Move Paragraph Down //
        moveParagraphDown(

            id: number

        ) {

            const blocks = this.document.getBlocks();

            const index = blocks.findIndex(

                block => block.id === id

            );

            if (

                index === -1 ||

                index >= blocks.length - 1

            ) {

                return;

            }

            this.moveParagraph(

                id,

                index + 1

            );

        }
        // ------------------- //
    // --------------- //

    // Change Paragraph Type //
    changeParagraphType(

        id: number,

        blockType: ScriptBlock["type"]

    ) {

        this.execute({

            type: "CHANGE_PARAGRAPH_TYPE",

            id,

            blockType,

        });

    }
    // --------------- //

    // Update Paragraph //
    updateParagraph(

        id: number,

        content: string

    ) {

        this.execute({

            type: "UPDATE_PARAGRAPH",

            id,

            content,

        });

    }
    // --------------- //

    // get statistics //
    getStatistics() {

        return this.statistics.getStatistics(

            this.getBlocks()

        );

    }
    // --------------------- //

    // is restoring history //
    isRestoringHistory() {

        return this.restoringHistory;

    }
    // -------------------------- //

    // undo (desfazer) //
    undo() {

        const executed = this.history.undo();

        if (!executed) {

            return;

        }

        this.restoringHistory = true;

        try {

            switch (executed.command.type) {

                case "UPDATE_PARAGRAPH": {

                    const undo =

                        executed.undoData as UpdateParagraphUndoData;

                    this.document.updateParagraph(

                        executed.command.id,

                        undo.previousContent

                    );

                    break;

                }

                
                case "INSERT_TEXT": {

                    const paragraph =

                        this.document.getParagraphById(

                            executed.command.paragraphId

                        );

                    if (paragraph) {

                        const content =

                            paragraph.content;

                        const newContent =

                            content.slice(

                                0,

                                executed.command.position

                            ) +

                            content.slice(

                                executed.command.position +

                                executed.command.text.length

                            );

                        this.document.updateParagraph(

                            executed.command.paragraphId,

                            newContent

                        );

                    }

                    break;

                }

                
                case "DELETE_TEXT": {

                    const paragraph =

                        this.document.getParagraphById(

                            executed.command.paragraphId

                        );

                    if (paragraph) {

                        const content =

                            paragraph.content;

                        const newContent =

                            content.slice(

                                0,

                                executed.command.position

                            ) +

                            executed.command.deletedText +

                            content.slice(

                                executed.command.position

                            );

                        this.document.updateParagraph(

                            executed.command.paragraphId,

                            newContent

                        );

                    }

                    break;

                }

                case "REPLACE_TEXT": {

                    const paragraph =

                        this.document.getParagraphById(

                            executed.command.paragraphId

                        );

                    if (paragraph) {

                        const content =

                            paragraph.content;

                        const newContent =

                            content.slice(

                                0,

                                executed.command.position

                            ) +

                            executed.command.removedText +

                            content.slice(

                                executed.command.position +

                                executed.command.insertedText.length

                            );

                        this.document.updateParagraph(

                            executed.command.paragraphId,

                            newContent

                        );

                    }

                    break;

                }

                case "REPLACE_SELECTION": {

                    const undo = executed.undoData as {
                        previousContent: string;
                        newContent: string;
                    };

                    this.document.updateParagraph(
                        executed.command.selection.start.paragraphId,
                        undo.previousContent
                    );

                    break;
                }

                case "REPLACE_SELECTION_MULTI": {

                    const undo =
                        executed.undoData as ReplaceSelectionMultiUndoData;

                    // restaura o conteúdo original do primeiro parágrafo
                    this.document.updateParagraph(

                        undo.previousParagraphs[0].id,

                        undo.previousParagraphs[0].content

                    );

                    // recria todos os outros parágrafos
                    for (

                        let i = 1;

                        i < undo.previousParagraphs.length;

                        i++

                    ) {

                        this.document.insertParagraph(

                            undo.previousParagraphs[i],

                            undo.insertIndex + i

                        );

                    }

                    break;

                }

                case "SPLIT_PARAGRAPH": {

                    const undo =

                        executed.undoData as SplitParagraphUndoData;

                    // remove o segundo parágrafo
                    this.document.deleteParagraph(

                        undo.newParagraphId

                    );

                    // restaura o conteúdo original
                    this.document.updateParagraph(

                        executed.command.id,

                        undo.originalContent

                    );

                    break;

                }

                case "MERGE_PREVIOUS": {

                    const undo =

                        executed.undoData as MergeParagraphUndoData;

                    // restaura o conteúdo do parágrafo anterior
                    this.document.updateParagraph(

                        undo.previousParagraphId,

                        undo.previousContent

                    );

                    // recria o segundo parágrafo
                    this.document.insertParagraph(

                        {

                            id: executed.command.id,

                            type: undo.paragraphType,

                            content: undo.currentContent,

                        },

                        undo.insertIndex

                    );

                    break;

                }

            }

            this.render();

            // REPLACE_SELECTION E REPLACE_SELECTION_MULTI //
            if (executed.selectionBefore) {

                this.documentView?.restoreSelection(

                    executed.selectionBefore

                );

            } else if (executed.caretBefore) {

                this.documentView?.restoreCaret(

                    executed.caretBefore

                );

            }
            // --------------------------- //

            this.notifyDocumentChanged();

        } finally {

            this.restoringHistory = false;

        }

    }
    // ---------------------- //

    // redo (refazer) //
    redo() {

        const executed = this.history.redo();

        if (!executed) {

            return;

        }

        this.restoringHistory = true;

        try {

            switch (executed.command.type) {

                case "UPDATE_PARAGRAPH": {

                    const undo =

                        executed.undoData as UpdateParagraphUndoData;

                    this.document.updateParagraph(

                        executed.command.id,

                        undo.newContent

                    );

                    break;

                }

                case "INSERT_TEXT": {

                    const paragraph =

                        this.document.getParagraphById(

                            executed.command.paragraphId

                        );

                    if (paragraph) {

                        const content = paragraph.content;

                        const newContent =

                            content.slice(

                                0,

                                executed.command.position

                            ) +

                            executed.command.text +

                            content.slice(

                                executed.command.position

                            );

                        this.document.updateParagraph(

                            executed.command.paragraphId,

                            newContent

                        );

                    }

                    break;

                }

                case "DELETE_TEXT": {

                    const paragraph =

                        this.document.getParagraphById(

                            executed.command.paragraphId

                        );

                    if (paragraph) {

                        const content = paragraph.content;

                        const newContent =

                            content.slice(

                                0,

                                executed.command.position

                            ) +

                            content.slice(

                                executed.command.position +

                                executed.command.deletedText.length

                            );

                        this.document.updateParagraph(

                            executed.command.paragraphId,

                            newContent

                        );

                    }

                    break;

                }

                case "REPLACE_TEXT": {

                    const paragraph =

                        this.document.getParagraphById(

                            executed.command.paragraphId

                        );

                    if (paragraph) {

                        const content =

                            paragraph.content;

                        const newContent =

                            content.slice(

                                0,

                                executed.command.position

                            ) +

                            executed.command.insertedText +

                            content.slice(

                                executed.command.position +

                                executed.command.removedText.length

                            );

                        this.document.updateParagraph(

                            executed.command.paragraphId,

                            newContent

                        );

                    }

                    break;

                }

                case "REPLACE_SELECTION": {

                    const undo = executed.undoData as {
                        previousContent: string;
                        newContent: string;
                    };

                    this.document.updateParagraph(
                        executed.command.selection.start.paragraphId,
                        undo.newContent
                    );

                    break;
                }

                case "SPLIT_PARAGRAPH": {

                    const undo =

                        executed.undoData as SplitParagraphUndoData;

                    this.document.splitParagraph(

                        executed.command.id,

                        executed.command.offset,

                        undo.newParagraphId

                    );

                    break;

                }

            }

            this.render();

            if (executed.selectionAfter) {

                this.documentView?.restoreSelection(
                    executed.selectionAfter
                );

            } else if (executed.caretAfter) {

                this.documentView?.restoreCaret(
                    executed.caretAfter
                );

            }

            this.notifyDocumentChanged();

        } finally {

            this.restoringHistory = false;

        }

    }
    // ---------------------- //

    // handle input //
    // onde os comandos são criados (delete, backspace, insert, etc) //
    handleInput(

        input: EditorInput

    ) {

        const paragraph =

            this.document.getParagraphById(

                input.paragraphId

            );

        if (!paragraph) {

            return;

        }

        const diff =

            this.textDiff.analyze(

                paragraph.content,

                input.content

            );


        switch (diff.type) {

            case "INSERT": {

                const command: InsertTextCommand = {

                    type: "INSERT_TEXT",

                    paragraphId: input.paragraphId,

                    position: diff.position,

                    text: diff.inserted,

                };

                this.execute(command);

                break;

            }

            case "DELETE": {

                const command: DeleteTextCommand = {

                    type: "DELETE_TEXT",

                    paragraphId: input.paragraphId,

                    position: diff.position,

                    deletedText: diff.removed,

                    direction:
                        input.inputType === "deleteContentBackward"
                            ? "backward"
                            : "forward",

                };

                this.execute(command);

                break;

            }

            case "REPLACE": {

                const command: ReplaceTextCommand = {

                    type: "REPLACE_TEXT",

                    paragraphId: input.paragraphId,

                    position: diff.position,

                    removedText: diff.removed,

                    insertedText: diff.inserted,

                };

                this.execute(command);

                break;

            }

        }

    }
    // ----------------------- //

}