// EditorEngine.ts
// src/editor/engine/

import type { EditorCommand } from "../commands/EditorCommands";
import type { ScriptBlock, ParagraphAlignment } from "../../types/script";

import { DocumentModel } from "../model/DocumentModel";

import { CommandExecutor } from "../commands/CommandExecutor";
import { StatisticsService } from "../services/StatisticsService";
import {
    SearchService,
    type SearchResult,
} from "../services/SearchService";
import { DocumentView } from "../view/DocumentView";

import { HistoryManager } from "../history/HistoryManager";
import type { EditorInput } from "../../types/EditorInput";

import type { InsertTextCommand } from "../commands/text/InsertTextCommand";
import { TextDiffService } from "../services/TextDiffService";
import type { DeleteTextCommand } from "../commands/text/DeleteTextCommand";
import type { ReplaceTextCommand } from "../commands/text/ReplaceTextCommand";
import type {
    ContentUndoData,
    SplitParagraphUndoData,
    MergeParagraphUndoData,
    ReplaceSelectionMultiUndoData,
    PasteMultiParagraphUndoData,
    CaretSnapshot,
    SelectionSnapshot,
    InsertParagraphUndoData,
    MoveParagraphUndoData,
    DeleteParagraphUndoData,
    ReplaceAllUndoData,
    FormatRunsUndoData,
    ParagraphAlignmentUndoData
} from "../history/UndoData";

import { getDefaultBlockContent }
from "../../layout/templates/ScriptBlockTemplates";
import type { Settings } from "../../types/settings";
import type { ScriptProject } from "../../types/project";
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
    private onSave: (() => void) | null = null;

    private restoringHistory = false;

    private onDocumentChangedListeners:

        Array<(blocks: ScriptBlock[]) => void> = [];

    
    // notifyDocumentChanged //
    private notifyDocumentChanged() {

        const blocks =
            this.document.getBlocks();

        for (
            const listener of
            this.onDocumentChangedListeners
        ) {

            listener(blocks);

        }

        this.onDirty();

    }
    
    // Executor //
    private executor =

        new CommandExecutor(

            this.document

        );

// =====================================================
//                REFATORAÇÃO COMPLETA
//                  (em andamento)
// =====================================================
private apply(

    command: EditorCommand

): {

    caretAfter?: CaretSnapshot;

    selectionAfter?: SelectionSnapshot;

} | null {

    switch (command.type) {

        default:

            return null;

    }

}   
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

// ---------------------------------------------------- //
setSaveHandler(
    handler: () => void
) {

    this.onSave = handler;

}

saveProject() {

    this.onSave?.();

}
// =====================================================
// Lifecycle
// =====================================================

    // attach //
    attach(
        root: HTMLDivElement,
        allowMoveBlocks: boolean,
        allowDeleteBlocks: boolean,
        pageNumberPosition: Settings["pageNumberPosition"],
        project: ScriptProject,
        projectFilePath: string | null,
        onSave: () => void,
        onOpen: () => void
    ) {

        if (this.documentView) {

            this.documentView.destroy();

        }

        this.root = root;

        this.documentView = new DocumentView(

            root,
            this,
            allowMoveBlocks,
            allowDeleteBlocks,
            pageNumberPosition,
            project,
            projectFilePath,
            onSave,
            onOpen

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

        return this.documentView?.getParagraphElementById(id) ?? null;

    }
    // ----------------------- //

    // getParagraphElementById //
    getParagraphElementById(
        id: number
    ): HTMLParagraphElement | null {

        return this.documentView
            ?.getParagraphElementById(id)
            ?? null;

    }

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

    // get page count //
    public getPageCount(): number {

        return this.documentView?.getPageCount() ?? 0;

    }
    // ---------------- //

    // toggleBold //
    public toggleBold() {

        const selection =
            this.documentView?.saveSelection();

        if (!selection) {

            return;

        }

        this.execute({

            type: "TOGGLE_BOLD",

            selection: {

                anchorParagraphId:
                    selection.anchorParagraphId,

                anchorOffset:
                    selection.anchorOffset,

                focusParagraphId:
                    selection.focusParagraphId,

                focusOffset:
                    selection.focusOffset,

            },

        });

    }

    // toggleItalic //
    public toggleItalic() {

        const selection =
            this.documentView?.saveSelection();

        if (!selection) {
            return;
        }

        this.execute({

            type: "TOGGLE_ITALIC",

            selection: {

                anchorParagraphId:
                    selection.anchorParagraphId,

                anchorOffset:
                    selection.anchorOffset,

                focusParagraphId:
                    selection.focusParagraphId,

                focusOffset:
                    selection.focusOffset,

            },

        });

    }

    // toggleUnderline //
    public toggleUnderline() {

        const selection =
            this.documentView?.saveSelection();

        if (!selection) {
            return;
        }

        this.execute({

            type: "TOGGLE_UNDERLINE",

            selection: {

                anchorParagraphId:
                    selection.anchorParagraphId,

                anchorOffset:
                    selection.anchorOffset,

                focusParagraphId:
                    selection.focusParagraphId,

                focusOffset:
                    selection.focusOffset,

            },

        });

    }

    // toggleStrike //
    public toggleStrike() {

        const selection =
            this.documentView?.saveSelection();

        if (!selection) {
            return;
        }

        this.execute({

            type: "TOGGLE_STRIKE",

            selection: {

                anchorParagraphId:
                    selection.anchorParagraphId,

                anchorOffset:
                    selection.anchorOffset,

                focusParagraphId:
                    selection.focusParagraphId,

                focusOffset:
                    selection.focusOffset,

            },

        });

    }

    // setParagraphAlignment //
    public setParagraphAlignment(
        alignment: ParagraphAlignment
    ) {

        const selection =
            this.documentView?.saveSelection();

        if (!selection) {
            return;
        }

        if (
            selection.anchorParagraphId !==
            selection.focusParagraphId
        ) {
            return;
        }

        this.execute({

            type: "SET_PARAGRAPH_ALIGNMENT",

            paragraphId:
                selection.anchorParagraphId,

            alignment,

        });

    }

    // render //
    render() {

        if (!this.documentView) {

            return;

        }

        this.documentView.render(

            this.document.getParagraphs()

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

    // =====================================================
    // SEARCH
    // =====================================================

    searchBlocks(
        term: string,
        caseSensitive: boolean = false,
        ignoreAccents: boolean = true
    ): SearchResult[] {

        return this.search.search(
            this.getBlocks(),
            term,
            caseSensitive,
            ignoreAccents
        );

    }

    // =====================================================
    // REPLACE CURRENT SEARCH RESULT
    // =====================================================

    replaceCurrentSearchResult(
        paragraphId: number,
        searchTerm: string,
        replacement: string,
        caseSensitive: boolean = false,
        ignoreAccents: boolean = true,
        occurrenceIndex: number = 0
    ) {

        if (!searchTerm.trim()) {

            return;

        }

        const paragraph =
            this.document
                .getBlocks()
                .find(
                    block =>
                        block.id === paragraphId
                );

        if (!paragraph) {

            return;

        }

        const occurrences =
            this.search.findOccurrences(
                paragraph.content,
                searchTerm,
                caseSensitive,
                ignoreAccents
            );

        if (occurrences.length === 0) {

            return;

        }

        const occurrence = occurrences[occurrenceIndex];

        if (!occurrence) {
            return;
        }

        const removedText =
            paragraph.content.slice(
                occurrence.start,
                occurrence.end
            );

        this.execute({

            type: "REPLACE_TEXT",

            paragraphId,

            position:
                occurrence.start,

            removedText,

            insertedText:
                replacement,

        });

    }

    // =========================================================
    // SEARCH HIGHLIGHTS
    // =========================================================

    highlightSearchResult(
        result: SearchResult,
        term: string,
        active: boolean = true,
        clearPrevious: boolean = true,
        scrollToActive: boolean = true,
        caseSensitive: boolean = false,
        ignoreAccents: boolean = true
    ) {

        this.documentView?.highlightSearchResult(
            result.paragraphId,
            term,
            active,
            clearPrevious,
            scrollToActive,
            caseSensitive,
            ignoreAccents,
            result.occurrenceIndex
        );

    }

    // clearSearcHighlights
    clearSearchHighlights() {

        this.documentView?.clearSearchHighlights();

    }

    // =========================================================
    // HIGHLIGHT ALL SEARCH RESULTS
    // =========================================================

    highlightSearchResults(
        results: SearchResult[],
        activeIndex: number,
        term: string,
        caseSensitive: boolean = false,
        ignoreAccents: boolean = true
    ) {

        if (!term.trim()) {

            this.documentView?.clearSearchHighlights();

            return;

        }

        // -----------------------------------------------------
        // VERIFICA ONDE ESTÁ O FOCO
        // -----------------------------------------------------

        const activeElement =
            document.activeElement;

        const editorHasFocus =
            this.root?.contains(activeElement) ?? false;

        // -----------------------------------------------------
        // SALVA A SELEÇÃO SOMENTE SE O EDITOR ESTIVER FOCADO
        // -----------------------------------------------------

        const savedSelection =
            editorHasFocus
                ? this.documentView?.saveSelection()
                : undefined;

        // -----------------------------------------------------
        // LIMPA HIGHLIGHTS ANTIGOS
        // -----------------------------------------------------

        this.documentView?.clearSearchHighlights();

        // -----------------------------------------------------
        // AGRUPA OS RESULTADOS POR PARÁGRAFO
        // -----------------------------------------------------

        const resultsByParagraph =
            new Map<number, SearchResult[]>();

        results.forEach(
            result => {

                const existing =
                    resultsByParagraph.get(
                        result.paragraphId
                    );

                if (existing) {

                    existing.push(result);

                } else {

                    resultsByParagraph.set(
                        result.paragraphId,
                        [result]
                    );

                }

            }
        );

        // -----------------------------------------------------
        // LOCALIZA A OCORRÊNCIA ATIVA
        // -----------------------------------------------------

        const activeResult =
            results[activeIndex];

        // -----------------------------------------------------
        // DESTACA CADA PARÁGRAFO UMA ÚNICA VEZ
        // -----------------------------------------------------

        resultsByParagraph.forEach(
            paragraphResults => {

                const paragraphId =
                    paragraphResults[0]?.paragraphId;

                if (paragraphId === undefined) {

                    return;

                }

                const isActiveParagraph =
                    activeResult?.paragraphId === paragraphId;

                const activeOccurrenceIndex =
                    isActiveParagraph
                        ? activeResult.occurrenceIndex
                        : -1;

                this.documentView?.highlightSearchResult(
                    paragraphId,
                    term,
                    isActiveParagraph,
                    false,
                    isActiveParagraph,
                    caseSensitive,
                    ignoreAccents,
                    activeOccurrenceIndex
                );

            }
        );

        // -----------------------------------------------------
        // RESTAURA O CARET DA FOLHA
        // -----------------------------------------------------

        if (savedSelection) {

            this.documentView?.restoreSelection(
                savedSelection
            );

        }

        // -----------------------------------------------------
        // SCROLL PARA O RESULTADO ATIVO
        // -----------------------------------------------------

        if (
            editorHasFocus &&
            activeResult
        ) {

            const paragraph =
                this.getParagraphElementById(
                    activeResult.paragraphId
                );

            const activeHighlight =
                paragraph?.querySelector(
                    ".search-highlight-active"
                );

            activeHighlight?.scrollIntoView({

                behavior: "smooth",

                block: "center",

            });

        }

    }
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

        // =========================================================
        // DEFINE O CARET APÓS A EXECUÇÃO DO COMANDO
        // =========================================================

        if (
            command.type === "MOVE_PARAGRAPH" &&
            beforeCaret
        ) {

            executed.caretAfter =
                beforeCaret;

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
            
        } else if (
            command.type === "MOVE_PARAGRAPH" &&
            beforeCaret
        ) {

            this.documentView?.restoreCaret(
                beforeCaret
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

    // insertBlock //
    public insertBlock(

        type: ScriptBlock["type"],

        content?: string

    ) {

        switch (type) {

            case "character":

                this.insertCharacter(content);
                return;

            case "scene":

                this.insertScene(content);
                return;

            case "transition":

                this.insertTransition(content);
                return;

            default:

                this.insertSimpleBlock(

                    type,

                    content

                );

        }

    }

            // insertSimpleBlock
            private insertSimpleBlock(

                type: ScriptBlock["type"],

                content?: string

            ) {

                const blocks =
                    this.document.getBlocks();

                const finalContent =
                    content || getDefaultBlockContent(type);

                // -----------------------------------------
                // Descobre o parágrafo atual do caret
                // -----------------------------------------

                const selection =
                    this.documentView?.saveSelection();

                let insertIndex =
                    blocks.length;

                if (selection) {

                    const currentIndex =
                        blocks.findIndex(
                            block =>
                                block.id ===
                                selection.focusParagraphId
                        );

                    if (currentIndex !== -1) {

                        insertIndex =
                            currentIndex + 1;

                    }

                }

                // -----------------------------------------
                // Insere o novo bloco
                // -----------------------------------------

                this.insertParagraph({

                    id: Date.now(),

                    type,

                    content: finalContent,

                }, insertIndex);

            }

            // insertCharacter
            private insertCharacter(

                content?: string

            ) {

                this.insertSimpleBlock(

                    "character",

                    content

                );

            }

            private insertScene(

                content?: string

            ) {

                this.insertSimpleBlock(

                    "scene",

                    content

                );

            }

            private insertTransition(

                content?: string

            ) {

                this.insertSimpleBlock(

                    "transition",

                    content

                );

            }

            // onDirty
            // (alterações não salvas no arquivo)
            private onDirty: () => void = () => {};

            setDirtyHandler(
                handler: () => void
            ) {

                this.onDirty = handler;

            }

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

                        executed.undoData as ContentUndoData;

                    this.document.updateParagraph(

                        executed.command.id,

                        undo.previousContent

                    );

                    break;

                }

                case "INSERT_PARAGRAPH": {

                    const undo =

                        executed.undoData as InsertParagraphUndoData;

                    this.document.deleteParagraph(

                        undo.block.id

                    );

                    break;

                }

                case "MOVE_PARAGRAPH": {

                    const undo =
                        executed.undoData as MoveParagraphUndoData;

                    this.document.moveParagraph(

                        executed.command.id,

                        undo.previousIndex

                    );

                    break;

                }

                // TOGGLE BOLD //
                case "TOGGLE_BOLD": {

                    const undo =
                        executed.undoData as FormatRunsUndoData;

                    for (const paragraph of undo.paragraphs) {

                        const paragraphModel =
                            this.document.getParagraphById(
                                paragraph.paragraphId
                            );

                        if (!paragraphModel) {

                            continue;

                        }

                        paragraphModel.setRuns(

                            structuredClone(
                                paragraph.previousRuns
                            )

                        );

                    }

                    break;
                }
                // ------------------------//

                // TOGGLE ITALIC //
                case "TOGGLE_ITALIC": {

                    const undo =
                        executed.undoData as FormatRunsUndoData;

                    for (const paragraph of undo.paragraphs) {

                        const paragraphModel =
                            this.document.getParagraphById(
                                paragraph.paragraphId
                            );

                        if (!paragraphModel) {
                            continue;
                        }

                        paragraphModel.setRuns(
                            structuredClone(
                                paragraph.previousRuns
                            )
                        );

                    }

                    break;

                }


                // TOOGLE UNDERLINE //
                case "TOGGLE_UNDERLINE": {

                    const undo =
                        executed.undoData as FormatRunsUndoData;

                    for (const paragraph of undo.paragraphs) {

                        const paragraphModel =
                            this.document.getParagraphById(
                                paragraph.paragraphId
                            );

                        if (!paragraphModel) {
                            continue;
                        }

                        paragraphModel.setRuns(
                            structuredClone(
                                paragraph.previousRuns
                            )
                        );

                    }

                    break;

                }

                // TOGGLE STRIKE //
                case "TOGGLE_STRIKE": {

                    const undo =
                        executed.undoData as FormatRunsUndoData;

                    for (const paragraph of undo.paragraphs) {

                        const paragraphModel =
                            this.document.getParagraphById(
                                paragraph.paragraphId
                            );

                        if (!paragraphModel) {
                            continue;
                        }

                        paragraphModel.setRuns(
                            structuredClone(
                                paragraph.previousRuns
                            )
                        );

                    }

                    break;

                }

                // SET PARAGRAPH ALIGNMENT //
                case "SET_PARAGRAPH_ALIGNMENT": {

                    const undo =
                        executed.undoData as ParagraphAlignmentUndoData;

                    const paragraph =
                        this.document.getParagraphById(
                            undo.paragraphId
                        );

                    if (paragraph) {

                        paragraph.alignment =
                            undo.previousAlignment;

                    }

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

                case "DELETE_PARAGRAPH": {

                    const undo =
                        executed.undoData as DeleteParagraphUndoData;

                    this.document.insertParagraph(

                        undo.block,

                        undo.index

                    );

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

                case "REPLACE_ALL": {

                    const undo =
                        executed.undoData as ReplaceAllUndoData;

                    this.document.load(
                        undo.previousParagraphs
                    );

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

                case "PASTE_MULTI_PARAGRAPH": {

                    const undo = executed.undoData as PasteMultiParagraphUndoData;

                    // remove todos os parágrafos criados
                    for (const id of undo.createdParagraphIds) {

                        this.document.deleteParagraph(id);

                    }

                    // restaura o documento exatamente como era
                    for (const paragraph of undo.previousParagraphs) {

                        const current = this.document.getParagraphById(paragraph.id);

                        if (current) {

                            this.document.updateParagraph(

                                paragraph.id,

                                paragraph.content

                            );

                        }

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

                        undo.previousParagraphId!,

                        undo.previousContent!

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

                // MERGE NEXT //
                case "MERGE_NEXT": {

                    const undo =

                        executed.undoData as MergeParagraphUndoData;

                    // restaura o conteúdo original do parágrafo atual
                    this.document.updateParagraph(

                        undo.currentParagraphId,

                        undo.currentContent

                    );

                    // recria o próximo parágrafo
                    this.document.insertParagraph(

                        undo.nextParagraph!,

                        undo.insertIndex

                    );

                    break;

                }
                // -----------------/ /

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

                        executed.undoData as ContentUndoData;

                    this.document.updateParagraph(

                        executed.command.id,

                        undo.newContent

                    );

                    break;

                }

                case "INSERT_PARAGRAPH": {

                    const undo =

                        executed.undoData as InsertParagraphUndoData;

                    this.document.insertParagraph(

                        undo.block,

                        undo.index

                    );

                    break;

                }

                case "MOVE_PARAGRAPH": {

                    const undo =
                        executed.undoData as MoveParagraphUndoData;

                    this.document.moveParagraph(

                        executed.command.id,

                        undo.newIndex

                    );

                    break;

                }

                // TOGGLE BOLD //
                case "TOGGLE_BOLD": {

                    const undo =
                        executed.undoData as FormatRunsUndoData;

                    for (const paragraph of undo.paragraphs) {

                        const paragraphModel =
                            this.document.getParagraphById(
                                paragraph.paragraphId
                            );

                        if (!paragraphModel) {

                            continue;

                        }

                        paragraphModel.setRuns(

                            structuredClone(
                                paragraph.newRuns
                            )

                        );

                    }

                    break;
                }

                // TOGGLE ITALIC //
                case "TOGGLE_ITALIC": {

                    const undo =
                        executed.undoData as FormatRunsUndoData;

                    for (const paragraph of undo.paragraphs) {

                        const paragraphModel =
                            this.document.getParagraphById(
                                paragraph.paragraphId
                            );

                        if (!paragraphModel) {
                            continue;
                        }

                        paragraphModel.setRuns(
                            structuredClone(
                                paragraph.newRuns
                            )
                        );

                    }

                    break;

                }

                // TOGGLE UNDERLINE //
                case "TOGGLE_UNDERLINE": {

                    const undo =
                        executed.undoData as FormatRunsUndoData;

                    for (const paragraph of undo.paragraphs) {

                        const paragraphModel =
                            this.document.getParagraphById(
                                paragraph.paragraphId
                            );

                        if (!paragraphModel) {
                            continue;
                        }

                        paragraphModel.setRuns(
                            structuredClone(
                                paragraph.newRuns
                            )
                        );

                    }

                    break;

                }

                // TOGGLE STRIKE //
                case "TOGGLE_STRIKE": {

                    const undo =
                        executed.undoData as FormatRunsUndoData;

                    for (const paragraph of undo.paragraphs) {

                        const paragraphModel =
                            this.document.getParagraphById(
                                paragraph.paragraphId
                            );

                        if (!paragraphModel) {
                            continue;
                        }

                        paragraphModel.setRuns(
                            structuredClone(
                                paragraph.newRuns
                            )
                        );

                    }

                    break;

                }

                // SET PARAGRAPH ALIGNMENT //
                case "SET_PARAGRAPH_ALIGNMENT": {

                    const undo =
                        executed.undoData as ParagraphAlignmentUndoData;

                    const paragraph =
                        this.document.getParagraphById(
                            undo.paragraphId
                        );

                    if (paragraph) {

                        paragraph.alignment =
                            undo.newAlignment;

                    }

                    break;

                }

                // INSERT TEXT //
                case "INSERT_TEXT": {

                    this.executor.applyInsertText(

                        executed.command

                    );

                    break;

                }
                // ------

                // DELETE TEXT //
                case "DELETE_TEXT": {

                    this.executor.applyDeleteText(

                        executed.command

                    );

                    break;

                }
                // -------

                case "DELETE_PARAGRAPH": {

                    this.executor.execute(
                        executed.command
                    );

                    break;

                }

                // REPLACE TEXT //
                case "REPLACE_TEXT": {

                    this.executor.applyReplaceText(

                        executed.command

                    );

                    break;

                }
                // ------------- //

                case "REPLACE_ALL": {

                    this.executor.applyReplaceAll(
                        executed.command
                    );

                    break;

                }

                // REPLACE SELECTION //
                case "REPLACE_SELECTION": {

                    this.executor.applyReplaceSelection(

                        executed.command

                    );

                    break;

                }
                // ------------ //

                // REPLACE SELECTION MULTI" //
                case "REPLACE_SELECTION_MULTI": {

                    this.executor.applyReplaceSelectionMulti(

                        executed.command

                    );

                    break;

                }
                // --------------/ /

                // MERGE NEXT //
                case "MERGE_NEXT": {

                    this.executor.applyMergeNext(

                        executed.command

                    );

                    break;

                }
                // ---------------------- //

                // MERGE PREVIOUS //
                case "MERGE_PREVIOUS": {

                    this.executor.applyMergePrevious(

                        executed.command

                    );

                    break;

                }
                // ------------------------ //

                case "PASTE_MULTI_PARAGRAPH": {

                    const result =
                        this.executor.applyPasteMultiParagraph(
                            executed.command
                        );

                    if (result) {

                        executed.caretAfter = result.caret;

                        const undo =
                            executed.undoData as PasteMultiParagraphUndoData;

                        undo.createdParagraphIds =
                            result.createdParagraphIds;

                    }

                    break;

                }

                // SPLIT PARAGRAPH //
                case "SPLIT_PARAGRAPH": {

                    const undo =
                        executed.undoData as SplitParagraphUndoData;

                    const result =
                        this.executor.applySplitParagraph(

                            executed.command,

                            undo.newParagraphId

                        );

                    if (result) {

                        executed.caretAfter =
                            result.caret;

                    }

                    break;

                }
                // -------------- //

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

        let position = input.caretOffset;

            switch (diff.type) {

                case "INSERT":

                    position = input.caretOffset - diff.inserted.length;
                    break;

                case "DELETE":

                    position = input.caretOffset;
                    break;

                case "REPLACE":

                    position = input.caretOffset - diff.inserted.length;
                    break;

            }


        switch (diff.type) {

            case "INSERT": {

                const command: InsertTextCommand = {

                    type: "INSERT_TEXT",

                    paragraphId: input.paragraphId,

                    position: position,

                    text: diff.inserted,

                };

                this.execute(command);

                break;

            }

            case "DELETE": {

                const command: DeleteTextCommand = {

                    type: "DELETE_TEXT",

                    paragraphId: input.paragraphId,

                    position: position,

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

                    position: position,

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