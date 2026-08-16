// DocumentView.ts
// src/editor/view/

import { Paragraph } from "../document/Paragraph";
import { CursorController } from "../controller/CursorController";
import { EditController } from "../controller/EditController";
import type { EditorEngine } from "../engine/EditorEngine";
import { SelectionManager } from "../selection/SelectionManager";

import type { CaretSnapshot } from "../history/UndoData";
import type { SelectionSnapshot } from "../history/UndoData";
import { ClipboardManager } from "../clipboard/ClipboardManager";

import { getEditorBlockLayout } from "../../layout";

// --------------------------------------------------------- //

export class DocumentView {

    private paragraphs: Paragraph[] = [];

    private elements =
        new Map<number, HTMLParagraphElement>();

    private wrappers =
        new Map<number, HTMLDivElement>();

    private root: HTMLDivElement;

    private engine: EditorEngine;

    private rendering = false;

    private cursor: CursorController;

    private selection =
        new SelectionManager();

    private clipboard =
        new ClipboardManager();

    private editor: EditController;

    private allowMoveBlocks: boolean;
    private allowDeleteBlocks: boolean;
    private onSave: () => void;

    // =========================================================
    // BEFORE INPUT
    // =========================================================

    private handleBeforeInput = (
        event: InputEvent
    ) => {

        this.editor.handleBeforeInput(event);

    };

    // =========================================================
    // INPUT
    // =========================================================

    private handleInput = (_event: InputEvent) => {

        // O documento é atualizado exclusivamente
        // pelo EditorEngine.

        return;

    };

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    constructor(
        root: HTMLDivElement,
        engine: EditorEngine,
        allowMoveBlocks: boolean,
        allowDeleteBlocks: boolean,
        onSave: () => void,
        onOpen: () => void,
    ) {

        this.root = root;
        this.root.contentEditable = "false";
        this.root.spellcheck = false;
        this.engine = engine;
        this.allowMoveBlocks = allowMoveBlocks;
        this.allowDeleteBlocks = allowDeleteBlocks;
        this.onSave = onSave;

        this.root.addEventListener(
            "input",
            this.handleRootInput
        );

        this.root.addEventListener(
            "beforeinput",
            this.handleBeforeInput
        );

        this.cursor =
            new CursorController(
                this.root,
                engine,
                this.selection
            );

        this.editor =
            new EditController(
                this.root,
                engine,
                this.selection,
                this.clipboard,
                onSave,
                onOpen
            );

        this.cursor.attach();

        this.editor.attach();

        document.addEventListener(
            "selectionchange",
            this.handleSelectionChange
        );

    }

    // =========================================================
    // ROOT
    // =========================================================

    getElement() {

        return this.root;

    }

    // =========================================================
    // CREATE PARAGRAPH
    // =========================================================

    private createParagraph(
        paragraph: Paragraph
    ): HTMLParagraphElement {

        // -----------------------------------------------------
        // WRAPPER
        // -----------------------------------------------------

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "editor-paragraph-wrapper";

        wrapper.dataset.id =
            String(paragraph.id);

        // -----------------------------------------------------
        // PARAGRAPH
        // -----------------------------------------------------

        const p =
            document.createElement("p");

        const layout =
            getEditorBlockLayout(
                paragraph.type
            );

        p.className =
            layout.className;

        p.style.width =
            `${layout.width}px`;

        p.style.maxWidth =
            `${layout.maxWidth}px`;

        p.style.marginLeft =
            `${layout.marginLeft}px`;

        p.style.marginBottom =
            `${layout.marginBottom}px`;

        p.style.lineHeight =
            `${layout.lineHeight}px`;

        p.style.textAlign =
            layout.align;

        p.dataset.id =
            String(paragraph.id);

        p.contentEditable =
            "true";

        this.renderRuns(
            p,
            paragraph
        );

        // -----------------------------------------------------
        // ACTIONS
        // -----------------------------------------------------

        if (
            this.allowMoveBlocks ||
            this.allowDeleteBlocks
        ) {

            const actions =
                this.createParagraphActions(
                    paragraph.id
                );

            wrapper.appendChild(actions);

        }

        // -----------------------------------------------------
        // MONTA ESTRUTURA
        // -----------------------------------------------------

        wrapper.appendChild(p);
        // -----------------------------------------------------
        // MAPS
        // -----------------------------------------------------

        this.wrappers.set(
            paragraph.id,
            wrapper
        );

        this.elements.set(
            paragraph.id,
            p
        );

        return p;

    }

    // =========================================================
    // CREATE ACTIONS
    // =========================================================

    private createParagraphActions(
        id: number
    ): HTMLDivElement {

        const actions =
            document.createElement("div");

        actions.className =
            "paragraph-actions";

        // -----------------------------------------------------
        // MOVE UP
        // -----------------------------------------------------

        const up =
            document.createElement("button");

        up.type = "button";

        up.className =
            "paragraph-action-button";

        up.textContent = "↑";

        up.title =
            "Mover bloco para cima";

        /*
        IMPORTANTE:

        O preventDefault no mousedown impede que o botão
        roube o foco/seleção do <p>.

        Isso evita perder o caret antes do movimento.
        */

        up.addEventListener(
            "mousedown",
            (event) => {

                event.preventDefault();

            }
        );

        up.addEventListener(
            "click",
            () => {

                this.engine.moveParagraphUp(id);

            }
        );

        // -----------------------------------------------------
        // MOVE DOWN
        // -----------------------------------------------------

        const down =
            document.createElement("button");

        down.type = "button";

        down.className =
            "paragraph-action-button";

        down.textContent = "↓";

        down.title =
            "Mover bloco para baixo";

        down.addEventListener(
            "mousedown",
            (event) => {

                event.preventDefault();

            }
        );

        down.addEventListener(
            "click",
            () => {

                this.engine.moveParagraphDown(id);

            }
        );

        // -----------------------------------------------------

        // -----------------------------------------------------
        // DELETE
        // -----------------------------------------------------

        const remove =
            document.createElement("button");

        remove.type = "button";

        remove.className =
            "paragraph-action-button paragraph-delete-button";

        remove.textContent = "🗑️";

        remove.title =
            "Apagar bloco";

        remove.addEventListener(
            "mousedown",
            (event) => {

                event.preventDefault();

            }
        );

        remove.addEventListener(
            "click",
            () => {

                this.engine.deleteParagraph(id);

            }
        );
        // ------------------------------------------- //

        // ---------------------------------- //


        if (this.allowMoveBlocks) {

            actions.appendChild(up);
            actions.appendChild(down);

        }

        if (this.allowDeleteBlocks) {

            actions.appendChild(remove);

        }

        return actions;

    }

    // =========================================================
    // UPDATE PARAGRAPH
    // =========================================================

    private updateParagraph(
        element: HTMLParagraphElement,
        paragraph: Paragraph
    ) {

        const layout =
            getEditorBlockLayout(
                paragraph.type
            );

        element.className =
            layout.className;

        element.style.width =
            `${layout.width}px`;

        element.style.maxWidth =
            `${layout.maxWidth}px`;

        element.style.marginLeft =
            `${layout.marginLeft}px`;

        element.style.marginBottom =
            `${layout.marginBottom}px`;

        element.style.lineHeight =
            `${layout.lineHeight}px`;

        element.style.textAlign =
            layout.align;

        /*
        Mantemos o comportamento atual.

        Como a arquitetura do editor é baseada no Engine,
        o conteúdo é redesenhado quando necessário.
        */

        this.renderRuns(
            element,
            paragraph
        );

    }

    // =========================================================
    // RENDER RUNS
    // =========================================================

    private renderRuns(
        element: HTMLParagraphElement,
        paragraph: Paragraph
    ) {

        const layout =
            getEditorBlockLayout(
                paragraph.type
            );

        element.replaceChildren();

        for (
            const run of paragraph.getRuns()
        ) {

            const span =
                document.createElement("span");

            let text =
                run.text;

            if (layout.uppercase) {

                text =
                    text.toUpperCase();

            }

            span.textContent =
                text;

            span.style.fontWeight =
                run.bold || layout.bold
                    ? "bold"
                    : "normal";

            span.style.fontStyle =
                run.italic || layout.italic
                    ? "italic"
                    : "normal";

            const decorations: string[] = [];

            if (run.underline) {

                decorations.push(
                    "underline"
                );

            }

            if (run.strike) {

                decorations.push(
                    "line-through"
                );

            }

            span.style.textDecoration =
                decorations.join(" ");

            element.appendChild(span);

        }

    }

    // =========================================================
    // ROOT INPUT
    // =========================================================

    private handleRootInput = (
        event: InputEvent
    ) => {

        this.handleInput(event);

    };

    // =========================================================
    // RENDER
    // =========================================================

    render(paragraphs: Paragraph[]) {

        /*const caret = this.cursor.saveCaret();*/

        this.rendering = true;

        this.paragraphs = paragraphs;

        const validIds = new Set<number>();

        // -----------------------------------------------------
        // ATUALIZA / CRIA
        // -----------------------------------------------------

        for (
            const paragraph of paragraphs
        ) {

            validIds.add(
                paragraph.id
            );

            let element =
                this.elements.get(
                    paragraph.id
                );

            if (!element) {

                element =
                    this.createParagraph(
                        paragraph
                    );

            } else {

                this.updateParagraph(
                    element,
                    paragraph
                );

            }

        }

        // -----------------------------------------------------
        // REMOVE APAGADOS
        // -----------------------------------------------------

        for (
            const [
                id,
                element
            ] of this.elements
        ) {

            if (
                !validIds.has(id)
            ) {

                const wrapper =
                    this.wrappers.get(id);

                wrapper?.remove();

                if (!wrapper) {

                    element.remove();

                }

                this.elements.delete(id);

                this.wrappers.delete(id);

            }

        }

        // -----------------------------------------------------
        // MANTÉM ORDEM
        // -----------------------------------------------------

        paragraphs.forEach(
            (
                paragraph,
                index
            ) => {

                const wrapper =
                    this.wrappers.get(
                        paragraph.id
                    );

                if (!wrapper) {

                    return;

                }

                const current =
                    this.root.children[index];

                if (
                    current !== wrapper
                ) {

                    this.root.insertBefore(

                        wrapper,

                        current ?? null

                    );

                }

            }
        );

        this.rendering = false;

        /*if (caret) {

            this.cursor.restoreCaret(
                caret
            );

        }*/

    }

    // =========================================================
    // DOCUMENT PARAGRAPHS
    // =========================================================

    getDocumentParagraphs() {

        return this.paragraphs;

    }

    // =========================================================
    // PARAGRAPH ELEMENTS
    // =========================================================

    getParagraphElements() {

        return Array.from(
            this.root.querySelectorAll(
                "p"
            )
        );

    }

    // =========================================================
    // PARAGRAPH BY ID
    // =========================================================

    getParagraphElementById(
        id: number
    ) {

        return this.root.querySelector(
            `p[data-id="${id}"]`
        ) as HTMLParagraphElement | null;

    }

    // =========================================================
    // DESTROY
    // =========================================================

    destroy() {

        this.root.removeEventListener(
            "input",
            this.handleRootInput
        );

        this.root.removeEventListener(
            "beforeinput",
            this.handleBeforeInput
        );

        this.cursor.detach();

        this.editor.detach();

        document.removeEventListener(
            "selectionchange",
            this.handleSelectionChange
        );

        this.elements.clear();

        this.wrappers.clear();

        this.root.replaceChildren();

    }

    // =========================================================
    // SAVE CARET
    // =========================================================

    saveCaret():
        CaretSnapshot | undefined {

        return this.cursor.saveCaret();

    }

    // =========================================================
    // SAVE SELECTION
    // =========================================================

    saveSelection():
        SelectionSnapshot | undefined {

        return this.selection.save();

    }

    // =========================================================
    // RESTORE CARET
    // =========================================================

    restoreCaret(
        caret: CaretSnapshot | null
    ) {

        this.cursor.restoreCaret(
            caret
        );

    }

    // =========================================================
    // RESTORE SELECTION
    // =========================================================

    restoreSelection(
        selection: SelectionSnapshot | null
    ) {

        this.selection.restore(
            selection
        );

    }

    // =========================================================
    // SELECTION CHANGE
    // =========================================================

    private handleSelectionChange = () => {

        if (this.rendering) {

            return;

        }

        if (

            document.activeElement !==
                this.root &&

            !this.root.contains(
                document.activeElement
            )

        ) {

            return;

        }

        this.selection
            .syncControllerFromDOM();

    };

    // =========================================================
    // CLEAR SEARCH HIGHLIGHTS
    // =========================================================

    clearSearchHighlights() {

        const highlights =
            this.root.querySelectorAll(
                ".search-highlight"
            );

        highlights.forEach(
            highlight => {

                const parent =
                    highlight.parentNode;

                if (!parent) {
                    return;
                }

                while (
                    highlight.firstChild
                ) {

                    parent.insertBefore(
                        highlight.firstChild,
                        highlight
                    );

                }

                highlight.remove();

            }
        );

        // Muito importante:
        // junta novamente os TextNodes separados
        // depois de remover os highlights.

        this.root
            .querySelectorAll("p")
            .forEach(
                paragraph => {

                    paragraph.normalize();

                }
            );

    }


    // =========================================================
    // HIGHLIGHT SEARCH RESULT
    // =========================================================
    highlightSearchResult(
        id: number,
        term: string,
        active: boolean = true,
        clearPrevious: boolean = true,
        scrollToActive: boolean = true,
        caseSensitive: boolean = false,
        ignoreAccents: boolean = true
    ) {

        if (clearPrevious) {

            this.clearSearchHighlights();

        }

        if (!term.trim()) {

            return;

        }

        const paragraph =
            this.getParagraphElementById(id);

        if (!paragraph) {

            return;

        }

        const text =
            paragraph.textContent ?? "";

        // -------------------------------------------------
        // NORMALIZAÇÃO
        // -------------------------------------------------

        const normalize = (value: string) => {

            let result = value;

            if (ignoreAccents) {

                result =
                    result
                        .normalize("NFD")
                        .replace(
                            /[\u0300-\u036f]/g,
                            ""
                        );

            }

            if (!caseSensitive) {

                result =
                    result.toLocaleLowerCase();

            }

            return result;

        };

        // -------------------------------------------------
        // TEXTO NORMALIZADO
        // -------------------------------------------------

        const normalizedText =
            normalize(text);

        const normalizedTerm =
            normalize(term);

        if (!normalizedTerm) {

            return;

        }

        // -------------------------------------------------
        // ENCONTRA OCORRÊNCIAS
        // -------------------------------------------------

        const matches: {
            start: number;
            end: number;
        }[] = [];

        let searchStart = 0;

        while (true) {

            const index =
                normalizedText.indexOf(
                    normalizedTerm,
                    searchStart
                );

            if (index === -1) {

                break;

            }

            // -------------------------------------------------
            // IMPORTANTE:
            //
            // normalizedText pode ter tamanho diferente
            // do texto original por causa dos acentos.
            //
            // Por isso não podemos simplesmente usar:
            //
            // index + term.length
            //
            // -------------------------------------------------

            let originalStart = -1;

            let originalEnd = -1;

            let normalizedPosition = 0;

            for (
                let originalIndex = 0;
                originalIndex < text.length;
                originalIndex++
            ) {

                const normalizedCharacter =
                    normalize(
                        text[originalIndex]
                    );

                const characterLength =
                    normalizedCharacter.length;

                if (
                    normalizedPosition === index &&
                    originalStart === -1
                ) {

                    originalStart =
                        originalIndex;

                }

                normalizedPosition +=
                    characterLength;

                if (
                    normalizedPosition >=
                    index +
                    normalizedTerm.length
                ) {

                    originalEnd =
                        originalIndex + 1;

                    break;

                }

            }

            if (
                originalStart !== -1 &&
                originalEnd !== -1
            ) {

                matches.push({

                    start:
                        originalStart,

                    end:
                        originalEnd,

                });

            }

            searchStart =
                index +
                normalizedTerm.length;

        }

        if (matches.length === 0) {

            return;

        }

        // -------------------------------------------------
        // RECONSTRÓI O PARÁGRAFO
        // -------------------------------------------------

        const fragment =
            document.createDocumentFragment();

        let position = 0;

        matches.forEach(
            (match, index) => {

                // -----------------------------------------
                // TEXTO ANTES DO MATCH
                // -----------------------------------------

                if (
                    match.start >
                    position
                ) {

                    fragment.appendChild(
                        document.createTextNode(
                            text.slice(
                                position,
                                match.start
                            )
                        )
                    );

                }

                // -----------------------------------------
                // HIGHLIGHT
                // -----------------------------------------

                const highlight =
                    document.createElement(
                        "span"
                    );

                highlight.className =
                    "search-highlight";

                if (
                    active &&
                    index === 0
                ) {

                    highlight.classList.add(
                        "search-highlight-active"
                    );

                }

                highlight.textContent =
                    text.slice(
                        match.start,
                        match.end
                    );

                fragment.appendChild(
                    highlight
                );

                position =
                    match.end;

            }
        );

        // ---------------------------------------------
        // TEXTO DEPOIS DO ÚLTIMO MATCH
        // ---------------------------------------------

        if (
            position <
            text.length
        ) {

            fragment.appendChild(
                document.createTextNode(
                    text.slice(
                        position
                    )
                )
            );

        }

        // ---------------------------------------------
        // APLICA
        // ---------------------------------------------

        paragraph.replaceChildren(
            fragment
        );

        // ---------------------------------------------
        // SCROLL
        // ---------------------------------------------

        if (scrollToActive) {

            const activeHighlight =
                paragraph.querySelector(
                    ".search-highlight-active"
                );

            activeHighlight?.scrollIntoView({

                behavior: "smooth",

                block: "center",

            });

        }

    }
    // ----------------------------------------------------- //
}