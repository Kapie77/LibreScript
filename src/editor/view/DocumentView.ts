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

        // -----------------------------------------------------
        // PEGA TODOS OS TEXT NODES
        // -----------------------------------------------------

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

            if (length > 0) {

                textNodes.push({
                    node: textNode,
                    start: offset,
                    end: offset + length,
                });

                offset += length;

            }

        }

        if (!textNodes.length) {

            return offsets;

        }

        // -----------------------------------------------------
        // CASO MAIS COMUM
        //
        // Um único TextNode.
        //
        // Em vez de medir TODOS os caracteres, descobrimos
        // onde a linha termina através de busca binária.
        // -----------------------------------------------------

        if (textNodes.length === 1) {

            const info =
                textNodes[0];

            const nodeText =
                info.node.textContent ?? "";

            const nodeLength =
                nodeText.length;

            // -------------------------------------------------
            // Mede a posição vertical de um intervalo.
            //
            // Usamos o centro vertical do primeiro caractere
            // do intervalo como referência.
            // -------------------------------------------------

            const getTop =
                (
                    start: number,
                    end: number
                ): number | null => {

                    if (
                        start >= end ||
                        start < 0 ||
                        end > nodeLength
                    ) {

                        return null;

                    }

                    const range =
                        document.createRange();

                    range.setStart(
                        info.node,
                        start
                    );

                    range.setEnd(
                        info.node,
                        Math.min(
                            start + 1,
                            end
                        )
                    );

                    const rect =
                        range.getBoundingClientRect();

                    return rect.height > 0
                        ? rect.top
                        : null;

                };

            // -------------------------------------------------
            // Primeiro caractere
            // -------------------------------------------------

            const firstTop =
                getTop(
                    0,
                    nodeLength
                );

            if (
                firstTop === null
            ) {

                return offsets;

            }

            // -------------------------------------------------
            // DESCOBRE AS LINHAS
            // -------------------------------------------------

            let lineStart = 0;

            let currentTop =
                firstTop;

            const tolerance = 2;

            while (
                lineStart < nodeLength
            ) {

                // ---------------------------------------------
                // Se estamos no último caractere, terminamos.
                // ---------------------------------------------

                if (
                    lineStart ===
                    nodeLength - 1
                ) {

                    offsets.push({
                        start:
                            lineStart,

                        end:
                            nodeLength,
                    });

                    break;

                }

                // ---------------------------------------------
                // Precisamos descobrir o maior índice que ainda
                // pertence à linha atual.
                //
                // Primeiro procuramos um limite superior.
                // ---------------------------------------------

                let low =
                    lineStart + 1;

                let high =
                    Math.min(
                        nodeLength,
                        Math.max(
                            low + 8,
                            low * 2
                        )
                    );

                let foundDifferentLine =
                    false;

                while (
                    high < nodeLength
                ) {

                    const top =
                        getTop(
                            high - 1,
                            high
                        );

                    if (
                        top === null
                    ) {

                        break;

                    }

                    if (
                        Math.abs(
                            top -
                            currentTop
                        ) > tolerance
                    ) {

                        foundDifferentLine =
                            true;

                        break;

                    }

                    low =
                        high;

                    high =
                        Math.min(
                            nodeLength,
                            high * 2
                        );

                }

                // ---------------------------------------------
                // Caso ainda não tenhamos encontrado uma linha
                // diferente, verificamos o final do texto.
                // ---------------------------------------------

                if (
                    !foundDifferentLine
                ) {

                    const lastTop =
                        getTop(
                            nodeLength - 1,
                            nodeLength
                        );

                    if (
                        lastTop === null ||
                        Math.abs(
                            lastTop -
                            currentTop
                        ) <= tolerance
                    ) {

                        offsets.push({
                            start:
                                lineStart,

                            end:
                                nodeLength,
                        });

                        break;

                    }

                    high =
                        nodeLength;

                }

                // ---------------------------------------------
                // BUSCA BINÁRIA
                //
                // low  = último ponto conhecido da linha atual
                // high = primeiro limite fora dela
                // ---------------------------------------------

                let left =
                    low;

                let right =
                    high;

                while (
                    left + 1 < right
                ) {

                    const middle =
                        Math.floor(
                            (
                                left +
                                right
                            ) / 2
                        );

                    const top =
                        getTop(
                            middle - 1,
                            middle
                        );

                    if (
                        top !== null &&
                        Math.abs(
                            top -
                            currentTop
                        ) <= tolerance
                    ) {

                        left =
                            middle;

                    } else {

                        right =
                            middle;

                    }

                }

                // ---------------------------------------------
                // A linha termina em "left".
                // ---------------------------------------------

                const lineEnd =
                    left;

                if (
                    lineEnd <= lineStart
                ) {

                    // Segurança contra loop infinito.
                    offsets.push({
                        start:
                            lineStart,

                        end:
                            Math.min(
                                lineStart + 1,
                                nodeLength
                            ),
                    });

                    lineStart += 1;

                    const nextTop =
                        getTop(
                            lineStart,
                            nodeLength
                        );

                    if (
                        nextTop !== null
                    ) {

                        currentTop =
                            nextTop;

                    }

                    continue;

                }

                offsets.push({
                    start:
                        lineStart,

                    end:
                        lineEnd,
                });

                // ---------------------------------------------
                // Próxima linha
                // ---------------------------------------------

                lineStart =
                    lineEnd;

                const nextTop =
                    getTop(
                        lineStart,
                        nodeLength
                    );

                if (
                    nextTop === null
                ) {

                    break;

                }

                currentTop =
                    nextTop;

            }

            // -------------------------------------------------
            // DEBUG
            // -------------------------------------------------

            if (
                text.length > 1000
            ) {

                console.log(
                    "[LINE OFFSETS OPTIMIZED]",
                    {
                        textLength:
                            text.length,

                        textNodes:
                            textNodes.length,

                        lines:
                            offsets.length,

                        lastOffset:
                            offsets[
                                offsets.length - 1
                            ],

                        lastLineText:
                            text.slice(
                                offsets[
                                    offsets.length - 1
                                ].start,
                                offsets[
                                    offsets.length - 1
                                ].end
                            ),

                        lastCharacter:
                            text.charAt(
                                text.length - 1
                            )
                    }
                );

            }

            return offsets;

        }

        // -----------------------------------------------------
        // FALLBACK
        //
        // Se existirem vários TextNodes, usamos a estratégia
        // antiga. Isso preserva a segurança para runs formatados.
        // -----------------------------------------------------

        const characterTops:
            number[] = [];

        let textNodeIndex = 0;

        for (
            let i = 0;
            i < text.length;
            i++
        ) {

            while (
                textNodeIndex <
                    textNodes.length &&
                i >=
                    textNodes[
                        textNodeIndex
                    ].end
            ) {

                textNodeIndex++;

            }

            const info =
                textNodes[
                    textNodeIndex
                ];

            if (!info) {

                continue;

            }

            const localOffset =
                i -
                info.start;

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

        if (
            characterTops.length === 0
        ) {

            return offsets;

        }

        // -----------------------------------------------------
        // AGRUPA OS CARACTERES PELA LINHA
        // -----------------------------------------------------

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
                    top -
                    currentTop
                ) > tolerance
            ) {

                offsets.push({
                    start:
                        lineStart,

                    end:
                        i,
                });

                lineStart =
                    i;

                currentTop =
                    top;

            }

        }

        offsets.push({
            start:
                lineStart,

            end:
                characterTops.length,
        });

        return offsets;

    }


    // =========================================================
    // SCREENPLAY PAGINATION
    // =========================================================

    // isDialogueCharacter
    private isDialogueCharacter(
        type: Paragraph["type"]
    ): boolean {

        return (
            type === "character" ||
            type === "character_contd" ||
            type === "character_os" ||
            type === "character_vo"
        );

    }

        // =========================================================
        // MEDE O PRIMEIRO FRAGMENTO DE UM BLOCO
        // =========================================================
        private measureFirstFragmentHeight(
            paragraph: Paragraph,
            element: HTMLParagraphElement,
            start: number,
            end: number
        ): number {

            const layout =
                getEditorBlockLayout(
                    paragraph.type
                );

            // -----------------------------------------------------
            // CRIA O PRIMEIRO FRAGMENTO
            //
            // O elemento original NÃO precisa estar conectado
            // ao DOM para servir como fonte do fragmento.
            // -----------------------------------------------------

            const fragment =
                this.createParagraphFragment(
                    element,
                    start,
                    end,
                    true
                );

            // -----------------------------------------------------
            // ESTILO
            // -----------------------------------------------------

            fragment.style.marginTop =
                `${layout.marginTop}px`;

            fragment.style.marginBottom =
                `${layout.marginBottom}px`;

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

            // -----------------------------------------------------
            // WRAPPER
            // -----------------------------------------------------

            const wrapper =
                this.createFragmentWrapper(
                    paragraph,
                    true
                );

            wrapper.appendChild(
                fragment
            );

            // -----------------------------------------------------
            // PÁGINA TEMPORÁRIA DE MEDIÇÃO
            // -----------------------------------------------------

            const measurementPage =
                document.createElement("div");

            measurementPage.className =
                "document-editor-page";

            measurementPage.style.width =
                `${PAGE_EDITOR.width}px`;

            measurementPage.style.height =
                `${PAGE_EDITOR.height}px`;

            measurementPage.style.paddingTop =
                `${PAGE_EDITOR.paddingTop}px`;

            measurementPage.style.paddingBottom =
                `${PAGE_EDITOR.paddingBottom}px`;

            measurementPage.style.paddingLeft =
                `${PAGE_EDITOR.paddingLeft}px`;

            measurementPage.style.paddingRight =
                `${PAGE_EDITOR.paddingRight}px`;

            measurementPage.style.boxSizing =
                "border-box";

            measurementPage.style.position =
                "absolute";

            measurementPage.style.left =
                "-100000px";

            measurementPage.style.top =
                "0";

            // -----------------------------------------------------
            // COLOCA A PÁGINA NO DOM
            // -----------------------------------------------------

            this.root.appendChild(
                measurementPage
            );

            measurementPage.appendChild(
                wrapper
            );

            // -----------------------------------------------------
            // POSICIONA AÇÕES
            // -----------------------------------------------------

            this.positionParagraphActions(
                wrapper,
                fragment
            );

            // -----------------------------------------------------
            // MEDE
            // -----------------------------------------------------

            console.log(
                "[MEASURE FIRST FRAGMENT RESULT]",
                {
                    paragraphId:
                        paragraph.id,

                    paragraphType:
                        paragraph.type,

                    text:
                        fragment.textContent?.slice(0, 100),

                    start,
                    end,

                    elementConnected:
                        element.isConnected,

                    measurementPageConnected:
                        measurementPage.isConnected,

                    measurementPageWidth:
                        measurementPage.getBoundingClientRect().width,

                    wrapperWidth:
                        wrapper.getBoundingClientRect().width,

                    fragmentWidth:
                        fragment.getBoundingClientRect().width,

                    wrapperHeight:
                        wrapper.getBoundingClientRect().height,

                    fragmentHeight:
                        fragment.getBoundingClientRect().height
                }
            );

            const height =
                wrapper.getBoundingClientRect().height;

            // -----------------------------------------------------
            // REMOVE
            // -----------------------------------------------------

            measurementPage.remove();

            return height;
        }

    // --------------------------------------------- //

    // =========================================================
    // MEDE A ALTURA DA PRIMEIRA LINHA VISUAL DE UM PARÁGRAFO
    // =========================================================
    private measureFirstVisualLineHeight(
        paragraph: Paragraph,
        element: HTMLParagraphElement
    ): number {

        const layout =
            getEditorBlockLayout(
                paragraph.type
            );

        // -----------------------------------------------------
        // CRIA UMA CÓPIA DO PARÁGRAFO
        // -----------------------------------------------------

        const measurementElement =
            document.createElement("p");

        measurementElement.className =
            element.className;

        measurementElement.style.cssText =
            element.style.cssText;

        measurementElement.contentEditable =
            "false";

        measurementElement.dataset.paragraphId =
            String(paragraph.id);

        // -----------------------------------------------------
        // COPIA O CONTEÚDO
        // -----------------------------------------------------

        const walker =
            document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT
            );

        let node:
            Node | null;

        while (
            node = walker.nextNode()
        ) {

            const textNode =
                node as Text;

            const parent =
                textNode.parentElement;

            const clonedNode =
                textNode.cloneNode(true) as Text;

            if (
                parent &&
                parent !== element
            ) {

                const clonedParent =
                    parent.cloneNode(false) as HTMLElement;

                clonedParent.appendChild(
                    clonedNode
                );

                measurementElement.appendChild(
                    clonedParent
                );

            } else {

                measurementElement.appendChild(
                    clonedNode
                );

            }

        }

        // -----------------------------------------------------
        // APLICA O LAYOUT REAL
        // -----------------------------------------------------

        measurementElement.style.marginTop =
            `${layout.marginTop}px`;

        measurementElement.style.marginBottom =
            `${layout.marginBottom}px`;

        measurementElement.style.lineHeight =
            `${layout.lineHeight}px`;

        measurementElement.style.width =
            `${layout.width}px`;

        measurementElement.style.maxWidth =
            `${layout.maxWidth}px`;

        measurementElement.style.marginLeft =
            `${layout.marginLeft}px`;

        measurementElement.style.textAlign =
            layout.align;

        // -----------------------------------------------------
        // PÁGINA TEMPORÁRIA
        // -----------------------------------------------------

        const measurementPage =
            document.createElement("div");

        measurementPage.className =
            "document-editor-page";

        measurementPage.style.width =
            `${PAGE_EDITOR.width}px`;

        measurementPage.style.height =
            `${PAGE_EDITOR.height}px`;

        measurementPage.style.paddingTop =
            `${PAGE_EDITOR.paddingTop}px`;

        measurementPage.style.paddingBottom =
            `${PAGE_EDITOR.paddingBottom}px`;

        measurementPage.style.paddingLeft =
            `${PAGE_EDITOR.paddingLeft}px`;

        measurementPage.style.paddingRight =
            `${PAGE_EDITOR.paddingRight}px`;

        measurementPage.style.boxSizing =
            "border-box";

        measurementPage.style.position =
            "absolute";

        measurementPage.style.left =
            "-100000px";

        measurementPage.style.top =
            "0";

        // -----------------------------------------------------
        // CONECTA ANTES DE MEDIR
        // -----------------------------------------------------

        this.root.appendChild(
            measurementPage
        );

        measurementPage.appendChild(
            measurementElement
        );

        // -----------------------------------------------------
        // AGORA O ELEMENTO TEM LAYOUT REAL
        // -----------------------------------------------------

        const lineOffsets =
            this.getLineOffsets(
                measurementElement
            );

        if (
            lineOffsets.length === 0
        ) {

            measurementPage.remove();

            return 0;

        }

        // -----------------------------------------------------
        // PRIMEIRA LINHA
        // -----------------------------------------------------

        const firstLine =
            lineOffsets[0];

        const fragment =
            this.createParagraphFragment(
                measurementElement,
                firstLine.start,
                firstLine.end,
                true
            );

        fragment.style.marginTop =
            `${layout.marginTop}px`;

        fragment.style.marginBottom =
            `${layout.marginBottom}px`;

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

        const wrapper =
            this.createFragmentWrapper(
                paragraph,
                true
            );

        wrapper.appendChild(
            fragment
        );

        measurementPage.innerHTML = "";

        measurementPage.appendChild(
            wrapper
        );

        this.positionParagraphActions(
            wrapper,
            fragment
        );

        const height =
            wrapper.getBoundingClientRect()
                .height;

        console.log(
            "[MEASURE FIRST VISUAL LINE]",
            {
                paragraphId:
                    paragraph.id,

                paragraphType:
                    paragraph.type,

                textLength:
                    measurementElement.textContent?.length ?? 0,

                lines:
                    lineOffsets.length,

                firstLineStart:
                    firstLine.start,

                firstLineEnd:
                    firstLine.end,

                firstLineText:
                    measurementElement.textContent
                        ?.slice(
                            firstLine.start,
                            firstLine.end
                        ),

                measurementElementWidth:
                    measurementElement
                        .getBoundingClientRect()
                        .width,

                measurementElementHeight:
                    measurementElement
                        .getBoundingClientRect()
                        .height,

                firstLineHeight:
                    height
            }
        );

        measurementPage.remove();

        return height;

    }

    // getNextParagraph
    private getNextParagraph(
        paragraphIndex: number
    ): Paragraph | null {

        if (
            paragraphIndex < 0 ||
            paragraphIndex >= this.paragraphs.length - 1
        ) {

            return null;

        }

        return (
            this.paragraphs[
                paragraphIndex + 1
            ] ?? null
        );

    }

    private isDialogueStart(
        paragraphIndex: number
    ): boolean {

        const paragraph =
            this.paragraphs[
                paragraphIndex
            ];

        if (!paragraph) {
            return false;
        }

        if (
            !this.isDialogueCharacter(
                paragraph.type
            )
        ) {

            return false;

        }

        const next =
            this.getNextParagraph(
                paragraphIndex
            );

        if (!next) {
            return false;
        }

        return (
            next.type === "dialogue" ||
            next.type === "parenthetical"
        );

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

        // -------------------------------------------------
        // PREPARA TODOS OS ELEMENTOS ANTES DA PAGINAÇÃO
        // -------------------------------------------------
        // Precisamos que os próximos parágrafos já existam
        // em this.elements para que a regra de Character
        // possa medir o primeiro fragmento do próximo bloco.

        for (
            const paragraph of paragraphs
        ) {

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
        // PROCESSA PARÁGRAFOS
        // -----------------------------------------------------

        for (
            let paragraphIndex = 0;
            paragraphIndex < paragraphs.length;
            paragraphIndex++
        ) {

            const paragraph = paragraphs[paragraphIndex];

            const nextParagraph = paragraphs[paragraphIndex + 1] ?? null;

            validIds.add(
                paragraph.id
            );

            const element =
                this.elements.get(
                    paragraph.id
                );

            if (!element) {

                continue;

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

            // -------------------------------------------------
            // BLOQUEIA O WRAPPER ORIGINAL
            // SEM REMOVER SEU LAYOUT
            wrapper.style.position =
                "absolute";

            wrapper.style.visibility =
                "hidden";
            // ------------------------------------------------- //

            const lineOffsets =
                this.getLineOffsets(
                    element
                );

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


                    // =========================================================
                    // PROCURA BINÁRIA DA QUANTIDADE DE LINHAS QUE CABE
                    // =========================================================
                    //
                    // Antes:
                    //   63 → 62 → 61 → 60 → ... → 42
                    //
                    // Agora:
                    //   63 → 31 → 47 → 39 → 43 → 41 → 42
                    //
                    // Isso reduz drasticamente a quantidade de fragmentos
                    // criados e medidos.
                    // =========================================================

                    const binarySearchStart = performance.now();

                    let minLines =
                        1;

                    let maxLines =
                        remaining;

                    let bestLines =
                        0;

                    while (
                        minLines <= maxLines
                    ) {

                        const linesToTake =
                            Math.floor(
                                (
                                    minLines +
                                    maxLines
                                ) / 2
                            );

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

                        // -----------------------------------------------------
                        // CRIA FRAGMENTO
                        // -----------------------------------------------------

                        const fragment =
                            this.createParagraphFragment(
                                element,
                                start,
                                end,
                                isFirstFragment
                            );

                        // -----------------------------------------------------
                        // ESTILO
                        // -----------------------------------------------------

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

                        // -----------------------------------------------------
                        // WRAPPER DO FRAGMENTO
                        // -----------------------------------------------------

                        const fragmentWrapper =
                            this.createFragmentWrapper(
                                paragraph,
                                isFirstFragment
                            );

                        fragmentWrapper.appendChild(
                            fragment
                        );

                        // -----------------------------------------------------
                        // COLOCA NO DOM PARA MEDIR
                        // -----------------------------------------------------

                        currentPage.appendChild(
                            fragmentWrapper
                        );

                        // -----------------------------------------------------
                        // POSICIONA AS AÇÕES
                        // -----------------------------------------------------

                        this.positionParagraphActions(
                            fragmentWrapper,
                            fragment
                        );

                        // -----------------------------------------------------
                        // MEDE
                        // -----------------------------------------------------

                        const fragmentHeight =
                            fragmentWrapper
                                .getBoundingClientRect()
                                .height;

                        const PAGINATION_SAFETY =
                            4;

                        const availableHeight =
                            PAGE_EDITOR.contentHeight -
                            currentHeight -
                            PAGINATION_SAFETY;

                        const isEmptyPage =
                            currentHeight === 0 &&
                            currentPage.children.length === 1;

                        let fits =
                            fragmentHeight <=
                            availableHeight;

                        // -----------------------------------------------------
                        // UMA LINHA SOZINHA PRECISA ENTRAR EM PÁGINA VAZIA
                        // -----------------------------------------------------

                        if (
                            isEmptyPage &&
                            linesToTake === 1
                        ) {

                            fits = true;

                        }

                        // -----------------------------------------------------
                        // REGRA CHARACTER + SPEECH
                        // -----------------------------------------------------

                        const isFirstFragmentOfParagraph =
                            lineIndex === 0;

                        const isWholeCharacter =
                            this.isDialogueCharacter(
                                paragraph.type
                            ) &&
                            isFirstFragmentOfParagraph &&
                            isLastFragment;

                        const nextIsSpeech =
                            nextParagraph !== null &&
                            (
                                nextParagraph.type === "parenthetical" ||
                                nextParagraph.type === "dialogue"
                            );

                        const shouldProtectCharacter =
                            isWholeCharacter &&
                            nextIsSpeech;

                        let characterNeedsNextPage =
                            false;

                        if (
                            shouldProtectCharacter &&
                            nextParagraph
                        ) {

                            const nextElement =
                                this.elements.get(
                                    nextParagraph.id
                                );

                            if (nextElement) {

                                const nextFirstLineHeight =
                                    this.measureFirstVisualLineHeight(
                                        nextParagraph,
                                        nextElement
                                    );

                                const remainingHeightAfterCharacter =
                                    availableHeight -
                                    fragmentHeight;

                                characterNeedsNextPage =
                                    remainingHeightAfterCharacter <
                                    nextFirstLineHeight;

                            }

                        }

                        // -----------------------------------------------------
                        // CHARACTER NÃO FICA ISOLADO NO FIM DA PÁGINA
                        // -----------------------------------------------------

                        if (
                            fits &&
                            isWholeCharacter &&
                            nextIsSpeech &&
                            characterNeedsNextPage
                        ) {

                            fits = false;

                        }

                        // -----------------------------------------------------
                        // DECISÃO DA BUSCA BINÁRIA
                        // -----------------------------------------------------

                        if (fits) {

                            // ---------------------------------------------
                            // Cabe.
                            //
                            // Guardamos esta quantidade como a melhor
                            // encontrada e tentamos colocar mais linhas.
                            // ---------------------------------------------

                            bestLines =
                                linesToTake;

                            currentPage.removeChild(
                                fragmentWrapper
                            );

                            minLines =
                                linesToTake + 1;

                        } else {

                            // ---------------------------------------------
                            // Não cabe.
                            //
                            // Tentamos menos linhas.
                            // ---------------------------------------------

                            currentPage.removeChild(
                                fragmentWrapper
                            );

                            maxLines =
                                linesToTake - 1;

                        }

                    }

                    console.log(
                        "[BINARY SEARCH PERFORMANCE]",
                        {
                            paragraphId: paragraph.id,
                            totalLines: lineOffsets.length,
                            bestLines,
                            duration:
                                Math.round(
                                    performance.now() -
                                    binarySearchStart
                                )
                        }
                    );

                    // =========================================================
                    // AGORA CRIAMOS DEFINITIVAMENTE O MELHOR FRAGMENTO
                    // =========================================================

                    // ---------------------------------------------------------
                    // NENHUMA LINHA COUBE
                    // ---------------------------------------------------------
                    //
                    // Isso pode acontecer principalmente pela regra 6.1:
                    //
                    // CHARACTER + próximo SPEECH
                    //
                    // Se o CHARACTER cabe na página, mas não sobra espaço
                    // suficiente para a primeira linha do diálogo seguinte,
                    // precisamos mandar o CHARACTER inteiro para a próxima
                    // página.
                    //
                    // IMPORTANTE:
                    // Não podemos simplesmente deixar bestLines = 0,
                    // porque o while continuaria tentando exatamente a mesma
                    // linha infinitamente.
                    // ---------------------------------------------------------

                    if (
                        bestLines === 0
                    ) {

                        // -----------------------------------------------------
                        // Se já existe conteúdo na página atual,
                        // começamos uma nova página.
                        // -----------------------------------------------------

                        if (
                            currentHeight > 0
                        ) {

                            currentPage =
                                this.createPage(
                                    this.pages.length + 1
                                );

                            currentHeight = 0;

                            // Não avançamos lineIndex.
                            //
                            // A mesma linha será tentada novamente,
                            // agora em uma página vazia.

                            continue;

                        }

                        // -----------------------------------------------------
                        // Se a página já está vazia, uma linha precisa entrar.
                        //
                        // Isso evita loop infinito caso uma única linha seja
                        // maior que a altura disponível ou a regra 6.1 ainda
                        // considere que não cabe.
                        // -----------------------------------------------------

                        bestLines = 1;

                    }

                    // =========================================================
                    // CRIA DEFINITIVAMENTE O MELHOR FRAGMENTO
                    // =========================================================

                    if (
                        bestLines > 0
                    ) {

                        const start =
                            lineOffsets[
                                lineIndex
                            ].start;

                        const end =
                            lineOffsets[
                                lineIndex +
                                bestLines -
                                1
                            ].end;

                        const isFirstFragment =
                            lineIndex === 0;

                        const isLastFragment =
                            lineIndex +
                            bestLines >=
                            lineOffsets.length;

                        const fragment =
                            this.createParagraphFragment(
                                element,
                                start,
                                end,
                                isFirstFragment
                            );

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

                        const fragmentWrapper =
                            this.createFragmentWrapper(
                                paragraph,
                                isFirstFragment
                            );

                        fragmentWrapper.appendChild(
                            fragment
                        );

                        currentPage.appendChild(
                            fragmentWrapper
                        );

                        this.positionParagraphActions(
                            fragmentWrapper,
                            fragment
                        );

                        const fragmentHeight =
                            fragmentWrapper
                                .getBoundingClientRect()
                                .height;

                        currentHeight +=
                            fragmentHeight;

                        lineIndex +=
                            bestLines;

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