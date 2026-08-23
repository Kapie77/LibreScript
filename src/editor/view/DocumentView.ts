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
import { PAGE_EDITOR } from "../../layout/config/PageEditor";

// --------------------------------------------------------- //

export class DocumentView {

    private paragraphs: Paragraph[] = [];
    private elements = new Map<number, HTMLParagraphElement>();
    private wrappers = new Map<number, HTMLDivElement>();
    private pages: HTMLDivElement[] = [];
    private root: HTMLDivElement;
    private engine: EditorEngine;
    private rendering = false;
    private cursor: CursorController;
    private selection = new SelectionManager();
    private clipboard = new ClipboardManager();
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
    // CREATE PAGE
    // =========================================================
    private createPage(
        pageNumber: number
    ): HTMLDivElement {

        // -----------------------------------------------------
        // WRAPPER DA PÁGINA
        // -----------------------------------------------------

        const pageWrapper =
            document.createElement("div");

        pageWrapper.className =
            "document-editor-page-wrapper";

        pageWrapper.style.position =
            "relative";

        pageWrapper.style.width =
            `${PAGE_EDITOR.width}px`;

        pageWrapper.style.height =
            `${PAGE_EDITOR.height}px`;

        pageWrapper.style.boxSizing =
            "border-box";

        // -----------------------------------------------------
        // PÁGINA REAL DO EDITOR
        // -----------------------------------------------------

        const page =
            document.createElement("div");

        page.className =
            "document-editor-page";

        page.style.width =
            `${PAGE_EDITOR.width}px`;

        page.style.height =
            `${PAGE_EDITOR.height}px`;

        page.style.paddingTop =
            `${PAGE_EDITOR.paddingTop}px`;

        page.style.paddingBottom =
            `${PAGE_EDITOR.paddingBottom}px`;

        page.style.paddingLeft =
            `${PAGE_EDITOR.paddingLeft}px`;

        page.style.paddingRight =
            `${PAGE_EDITOR.paddingRight}px`;

        page.style.boxSizing =
            "border-box";

        page.style.position =
            "relative";

        // -----------------------------------------------------
        // NÚMERO DA PÁGINA
        // FICA FORA DA ÁREA SELECIONÁVEL
        // -----------------------------------------------------

        if (pageNumber > 1) {

            const pageNumberElement =
                document.createElement("div");

            pageNumberElement.className =
                "document-page-number";

            pageNumberElement.textContent =
                `${pageNumber}.`;

            pageNumberElement.style.userSelect =
                "none";

            pageNumberElement.style.pointerEvents =
                "none";

            pageWrapper.appendChild(
                pageNumberElement
            );

        }

        // -----------------------------------------------------
        // PÁGINA FICA DENTRO DO WRAPPER
        // -----------------------------------------------------

        pageWrapper.appendChild(
            page
        );

        // -----------------------------------------------------
        // REGISTRA A PÁGINA REAL
        // -----------------------------------------------------

        this.pages.push(
            page
        );

        // -----------------------------------------------------
        // ADICIONA O WRAPPER AO ROOT
        // -----------------------------------------------------

        this.root.appendChild(
            pageWrapper
        );

        return page;

    }

    // =========================================================
    // PAGE COUNT
    // =========================================================
    public getPageCount(): number {

        return this.pages.length;

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

        p.style.marginTop =
            `${layout.marginTop}px`;

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
    // POSICIONA AÇÕES NO CENTRO DO PARÁGRAFO
    // =========================================================

    private positionParagraphActions(
        wrapper: HTMLDivElement,
        paragraph: HTMLParagraphElement
    ) {

        const actions =
            wrapper.querySelector(
                ".paragraph-actions"
            ) as HTMLDivElement | null;

        if (!actions) {
            return;
        }

        const wrapperRect =
            wrapper.getBoundingClientRect();

        const paragraphRect =
            paragraph.getBoundingClientRect();

        const paragraphCenter =
            paragraphRect.top +
            paragraphRect.height / 2;

        const top =
            paragraphCenter -
            wrapperRect.top;

        actions.style.top =
            `${top}px`;

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

        element.style.marginTop =
            `${layout.marginTop}px`;

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
    // QUEBRA DE LINHA
    // =========================================================
    private getLineBreakOffsets(
        element: HTMLParagraphElement
    ): number[] {

        const text =
            element.textContent ?? "";

        if (!text) {
            return [0];
        }

        const textNode =
            document.createTextNode(text);

        const temp =
            document.createElement("span");

        temp.style.position =
            "absolute";

        temp.style.visibility =
            "hidden";

        temp.style.whiteSpace =
            "pre-wrap";

        temp.style.width =
            `${element.clientWidth}px`;

        temp.style.font =
            getComputedStyle(element).font;

        temp.style.lineHeight =
            getComputedStyle(element).lineHeight;

        temp.appendChild(
            textNode
        );

        document.body.appendChild(
            temp
        );

        const offsets: number[] = [];

        let lastTop =
            -Infinity;

        for (
            let i = 0;
            i < text.length;
            i++
        ) {

            const range =
                document.createRange();

            range.setStart(
                textNode,
                i
            );

            range.setEnd(
                textNode,
                Math.min(
                    i + 1,
                    text.length
                )
            );

            const rect =
                range.getBoundingClientRect();

            if (
                rect.height > 0 &&
                rect.top !== lastTop
            ) {

                offsets.push(i);

                lastTop =
                    rect.top;

            }

            range.detach();

        }

        document.body.removeChild(
            temp
        );

        return offsets;

    }
    
    // =========================================================
    // CRIA UM FRAGMENTO VISUAL DE UM PARÁGRAFO
    // =========================================================
    private createParagraphFragment(
        original: HTMLParagraphElement,
        startOffset: number,
        endOffset: number,
        isFirstFragment: boolean
    ): HTMLParagraphElement {

        const fragment =
            document.createElement("p");

        fragment.className =
            original.className;

        fragment.style.cssText =
            original.style.cssText;

        fragment.contentEditable =
            "true";

        fragment.dataset.paragraphId =
            original.dataset.id ?? "";

        if (isFirstFragment) {

            fragment.dataset.id =
                original.dataset.id ?? "";

        }

        fragment.dataset.startOffset =
            String(startOffset);

        fragment.dataset.endOffset =
            String(endOffset);

        // -----------------------------------------------------
        // COPIA O CONTEÚDO DO RANGE
        // -----------------------------------------------------

        const walker =
            document.createTreeWalker(
                original,
                NodeFilter.SHOW_TEXT
            );

        let currentOffset = 0;

        let node:
            Node | null;

        while (
            node = walker.nextNode()
        ) {

            const textNode =
                node as Text;

            const textLength =
                textNode.textContent?.length ?? 0;

            const nodeStart =
                currentOffset;

            const nodeEnd =
                currentOffset +
                textLength;

            // Nenhuma parte deste nó pertence ao fragmento
            if (
                nodeEnd <= startOffset ||
                nodeStart >= endOffset
            ) {

                currentOffset =
                    nodeEnd;

                continue;

            }

            const localStart =
                Math.max(
                    0,
                    startOffset - nodeStart
                );

            const localEnd =
                Math.min(
                    textLength,
                    endOffset - nodeStart
                );

            const clonedNode =
                textNode.cloneNode(true) as Text;

            clonedNode.textContent =
                textNode.textContent?.slice(
                    localStart,
                    localEnd
                ) ?? "";

            // -------------------------------------------------
            // PRESERVA O SPAN ORIGINAL
            // -------------------------------------------------

            const parent =
                textNode.parentElement;

            if (
                parent &&
                parent !== original
            ) {

                const clonedParent =
                    parent.cloneNode(false) as HTMLElement;

                clonedParent.appendChild(
                    clonedNode
                );

                fragment.appendChild(
                    clonedParent
                );

            } else {

                fragment.appendChild(
                    clonedNode
                );

            }

            currentOffset =
                nodeEnd;

        }

        return fragment;

    }

    // =========================================================
    // CREATE FRAGMENT WRAPPER
    // =========================================================
    private createFragmentWrapper(
        paragraph: Paragraph,
        isFirstFragment: boolean
    ): HTMLDivElement {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "editor-paragraph-wrapper";

        wrapper.dataset.id =
            String(paragraph.id);

        // -------------------------------------------------
        // ACTIONS
        // -------------------------------------------------

        if (
            isFirstFragment &&
            (
                this.allowMoveBlocks ||
                this.allowDeleteBlocks
            )
        ) {

            const actions =
                this.createParagraphActions(
                    paragraph.id
                );

            wrapper.appendChild(
                actions
            );

        }

        return wrapper;

    }

    // =========================================================
    // DESCOBRE OS OFFSETS DAS LINHAS
    // =========================================================
    private getLineOffsets(
        element: HTMLParagraphElement
    ) {

        const text =
            element.textContent ?? "";

        const offsets: {
            start: number;
            end: number;
        }[] = [];

        if (!text.length) {

            return offsets;

        }

        const walker =
            document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT
            );

        const textNodes: {
            node: Text;
            start: number;
            end: number;
        }[] = [];

        let offset = 0;

        let node:
            Node | null;

        while (
            node = walker.nextNode()
        ) {

            const textNode =
                node as Text;

            const length =
                textNode.textContent?.length ?? 0;

            textNodes.push({
                node: textNode,
                start: offset,
                end: offset + length,
            });

            offset += length;

        }

        // -----------------------------------------------------
        // PEGA A POSIÇÃO VERTICAL DE CADA CARACTERE
        // -----------------------------------------------------

        const characterTops: number[] = [];

        for (
            let i = 0;
            i < text.length;
            i++
        ) {

            const info =
                textNodes.find(
                    item =>
                        i >= item.start &&
                        i < item.end
                );

            if (!info) {

                continue;

            }

            const localOffset =
                i - info.start;

            const range =
                document.createRange();

            range.setStart(
                info.node,
                localOffset
            );

            range.setEnd(
                info.node,
                Math.min(
                    localOffset + 1,
                    info.node.textContent?.length ?? 0
                )
            );

            const rect =
                range.getBoundingClientRect();

            characterTops.push(
                rect.top
            );

        }

        // -----------------------------------------------------
        // AGRUPA OS CARACTERES PELA LINHA
        // -----------------------------------------------------

        if (
            characterTops.length === 0
        ) {

            return offsets;

        }

        let lineStart = 0;
        let currentTop =
            characterTops[0];

        const tolerance = 2;

        for (
            let i = 1;
            i < characterTops.length;
            i++
        ) {

            const top =
                characterTops[i];

            if (
                Math.abs(
                    top - currentTop
                ) > tolerance
            ) {

                offsets.push({
                    start: lineStart,
                    end: i,
                });

                lineStart =
                    i;

                currentTop =
                    top;

            }

        }

        offsets.push({
            start: lineStart,
            end: characterTops.length,
        });

        return offsets;

    }

    // =========================================================
    // RENDER
    // =========================================================
    render(paragraphs: Paragraph[]) {

        this.rendering = true;

        this.paragraphs =
            paragraphs;

        // -----------------------------------------------------
        // REMOVE PÁGINAS ANTIGAS
        // -----------------------------------------------------

        for (
            const page of this.pages
        ) {

            const pageWrapper =
                page.parentElement;

            if (pageWrapper) {

                pageWrapper.remove();

            } else {

                page.remove();

            }

        }

        this.pages = [];

        // -----------------------------------------------------
        // PRIMEIRA PÁGINA
        // -----------------------------------------------------

        let currentPage =
            this.createPage(1);

        let currentHeight = 0;

        // -----------------------------------------------------
        // IDS VÁLIDOS
        // -----------------------------------------------------

        const validIds =
            new Set<number>();

        // -----------------------------------------------------
        // PROCESSA PARÁGRAFOS
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

            const wrapper =
                this.wrappers.get(
                    paragraph.id
                );

            if (!wrapper) {

                continue;

            }

            // -------------------------------------------------
            // COLOCA TEMPORARIAMENTE O BLOCO NO DOM
            // -------------------------------------------------

            currentPage.appendChild(
                wrapper
            );

            // -------------------------------------------------
            // POSICIONA OS BOTÕES NO CENTRO REAL DO <p>
            // -------------------------------------------------

            this.positionParagraphActions(
                wrapper,
                element
            );

            // -------------------------------------------------
            // AGORA O <p> ESTÁ CONECTADO
            // -------------------------------------------------

            const lineOffsets =
                this.getLineOffsets(
                    element
                );

            wrapper.remove();

            // -------------------------------------------------
            // BLOCO VAZIO
            // -------------------------------------------------

            if (
                lineOffsets.length === 0
            ) {

                currentPage.appendChild(
                    wrapper
                );

                currentHeight +=
                    wrapper.getBoundingClientRect()
                        .height;

                continue;

            }

            // -------------------------------------------------
            // PROCESSA CADA LINHA
            // -------------------------------------------------

            let lineIndex = 0;

            while (
                lineIndex <
                lineOffsets.length
            ) {

                const remaining =
                    lineOffsets.length -
                    lineIndex;

                const layout =
                    getEditorBlockLayout(
                        paragraph.type
                    );

                // Começamos tentando colocar
                // todas as linhas restantes.
                // Se não couber, vamos diminuindo.
                let linesToTake =
                    remaining;

                let fragmentAccepted =
                    false;

                while (
                    linesToTake > 0
                ) {

                    const start =
                        lineOffsets[
                            lineIndex
                        ].start;

                    const end =
                        lineOffsets[
                            lineIndex +
                            linesToTake -
                            1
                        ].end;

                    const isFirstFragment =
                        lineIndex === 0;

                    const isLastFragment =
                        lineIndex +
                        linesToTake >=
                        lineOffsets.length;

                    // -------------------------------------------------
                    // CRIA FRAGMENTO
                    // -------------------------------------------------
                    const fragment =
                        this.createParagraphFragment(
                            element,
                            start,
                            end,
                            isFirstFragment
                        );

                    // -------------------------------------------------
                    // ESTILO
                    // -------------------------------------------------

                    fragment.style.marginTop =
                        isFirstFragment
                            ? `${layout.marginTop}px`
                            : "0px";

                    fragment.style.marginBottom =
                        isLastFragment
                            ? `${layout.marginBottom}px`
                            : "0px";

                    fragment.style.lineHeight =
                        `${layout.lineHeight}px`;

                    fragment.style.width =
                        `${layout.width}px`;

                    fragment.style.maxWidth =
                        `${layout.maxWidth}px`;

                    fragment.style.marginLeft =
                        `${layout.marginLeft}px`;

                    fragment.style.textAlign =
                        layout.align;

                    // -------------------------------------------------
                    // WRAPPER DO FRAGMENTO
                    // -------------------------------------------------

                    const fragmentWrapper =
                        this.createFragmentWrapper(
                            paragraph,
                            isFirstFragment
                        );

                    fragmentWrapper.appendChild(
                        fragment
                    );

                    // -------------------------------------------------
                    // COLOCA NO DOM PARA MEDIR
                    // -------------------------------------------------

                    currentPage.appendChild(
                        fragmentWrapper
                    );

                    // -------------------------------------------------
                    // POSICIONA AS AÇÕES NO CENTRO DO FRAGMENTO
                    // -------------------------------------------------

                    this.positionParagraphActions(
                        fragmentWrapper,
                        fragment
                    );

                    // -------------------------------------------------
                    // MEDE O TAMANHO REAL
                    // -------------------------------------------------

                    const fragmentHeight = fragmentWrapper.getBoundingClientRect().height;
                        
                    const PAGINATION_SAFETY = 4;

                    const availableHeight =
                        PAGE_EDITOR.contentHeight -
                        currentHeight -
                        PAGINATION_SAFETY;

                    const fits =
                        fragmentHeight <=
                        availableHeight;

                    // -------------------------------------------------
                    // COUBE
                    // -------------------------------------------------

                    if (fits) {
                        currentHeight += fragmentHeight;

                        console.log("[PAGINATION ACCEPT]", {
                            paragraphId: paragraph.id,
                            page: this.pages.length,
                            lineIndex,
                            linesToTake,
                            totalLines: lineOffsets.length,
                            fragmentHeight,
                            currentHeight,
                            available: PAGE_EDITOR.contentHeight,
                            remainingLines:
                                lineOffsets.length -
                                (lineIndex + linesToTake),
                        });

                        lineIndex += linesToTake;
                        fragmentAccepted = true;
                        break;
                    }


                    // -------------------------------------------------
                    // NÃO COUBE
                    // -------------------------------------------------

                    currentPage.removeChild(
                        fragmentWrapper
                    );

                    linesToTake--;

                }


                if (!fragmentAccepted) {

                    // Isso só deveria acontecer
                    // se nem uma única linha couber.

                    currentPage =
                        this.createPage(
                            this.pages.length + 1
                        );

                    currentHeight = 0;

                    continue;

                }


            }

        }

        // -----------------------------------------------------
        // REMOVE PARÁGRAFOS APAGADOS
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

                this.elements.delete(
                    id
                );

                this.wrappers.delete(
                    id
                );

            }

        }

        this.rendering = false;

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