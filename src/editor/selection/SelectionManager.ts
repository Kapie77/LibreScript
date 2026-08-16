// SelectionManager.ts
// src/editor/selection/

import type { SelectionSnapshot } from "./SelectionSnapshot";

import type {
    SelectionRange,
    OrderedSelectionRange,
} from "./SelectionRange";

import type {
    MultiParagraphSelection,
} from "../history/UndoData";

import { SelectionController } from "./SelectionController";

// ------------------------------------------------------------------------- //

export class SelectionManager {

    private controller = new SelectionController();

    // ================================================================
    // PARÁGRAFOS / DOM
    // ================================================================

    private getParagraphElement(
        id: number
    ): HTMLParagraphElement | null {

        return document.querySelector(
            `p[data-id="${id}"]`
        ) as HTMLParagraphElement | null;

    }

    private findParagraph(
        node: Node | null
    ): HTMLParagraphElement | null {

        while (node) {

            if (
                node instanceof HTMLParagraphElement &&
                node.dataset.id
            ) {

                return node;

            }

            node = node.parentNode;

        }

        return null;

    }

    private getParagraphTextLength(
        paragraph: HTMLParagraphElement
    ): number {

        return paragraph.textContent?.length ?? 0;

    }

    // ================================================================
    // TEXT NODES
    // ================================================================

    /*
    Retorna todos os TextNodes reais dentro do parágrafo.

    O DocumentView atual renderiza o texto através de <span>,
    portanto não podemos assumir que o <p> possui um TextNode
    diretamente como filho.
    */

    private getTextNodes(
        paragraph: HTMLParagraphElement
    ): Text[] {

        const walker =
            document.createTreeWalker(
                paragraph,
                NodeFilter.SHOW_TEXT
            );

        const nodes: Text[] = [];

        let node: Node | null;

        while ((node = walker.nextNode())) {

            nodes.push(node as Text);

        }

        return nodes;

    }

    /*
    Garante que exista pelo menos um TextNode.

    Isso só é necessário para parágrafos realmente vazios.
    */

    private getFallbackTextNode(
        paragraph: HTMLParagraphElement
    ): Text {

        const existing =
            this.getTextNodes(paragraph);

        if (existing.length > 0) {

            return existing[0];

        }

        const textNode =
            document.createTextNode("");

        paragraph.appendChild(textNode);

        return textNode;

    }

    // ================================================================
    // LÓGICO → DOM
    // ================================================================

    /*
    Converte um offset lógico do parágrafo para:

        TextNode + offset

    Exemplo:

        <p>
            <span>Olá</span>
            <span>Mundo</span>
        </p>

    offset 4

    resulta em:

        segundo TextNode
        offset 1
    */

    private logicalOffsetToDOM(
        paragraph: HTMLParagraphElement,
        logicalOffset: number
    ): {
        node: Text;
        offset: number;
    } {

        const textNodes =
            this.getTextNodes(paragraph);

        if (textNodes.length === 0) {

            return {
                node: this.getFallbackTextNode(paragraph),
                offset: 0,
            };

        }

        const clampedOffset =
            Math.max(
                0,
                Math.min(
                    logicalOffset,
                    this.getParagraphTextLength(paragraph)
                )
            );

        let consumed = 0;

        for (const node of textNodes) {

            const length = node.length;

            if (
                clampedOffset <=
                consumed + length
            ) {

                return {
                    node,
                    offset:
                        clampedOffset - consumed,
                };

            }

            consumed += length;

        }

        const last =
            textNodes[textNodes.length - 1];

        return {
            node: last,
            offset: last.length,
        };

    }

    // ================================================================
    // DOM → LÓGICO
    // ================================================================

    /*
    Converte:

        TextNode + offset

    para:

        offset absoluto dentro do parágrafo.
    */

    private domOffsetToLogical(
        paragraph: HTMLParagraphElement,
        node: Node,
        offset: number
    ): number {

        const textNodes =
            this.getTextNodes(paragraph);

        let logicalOffset = 0;

        for (const textNode of textNodes) {

            if (textNode === node) {

                return logicalOffset +
                    Math.min(
                        offset,
                        textNode.length
                    );

            }

            logicalOffset += textNode.length;

        }

        /*
        Caso o browser tenha colocado o caret diretamente
        no <p> ou em outro elemento.

        Nesse caso usamos uma Range para calcular quantos
        caracteres existem antes da posição.
        */

        try {

            const range =
                document.createRange();

            range.selectNodeContents(paragraph);

            range.setEnd(
                node,
                Math.min(
                    offset,
                    node.textContent?.length ?? 0
                )
            );

            return range.toString().length;

        } catch {

            return 0;

        }

    }

    // ================================================================
    // DOM SELECTION
    // ================================================================

    getSelection() {

        return window.getSelection();

    }

    getRange() {

        const selection =
            this.getSelection();

        if (
            !selection ||
            selection.rangeCount === 0
        ) {

            return null;

        }

        return selection.getRangeAt(0);

    }

    // ================================================================
    // CARET
    // ================================================================

    moveCaretToParagraphStart(
        paragraph: HTMLParagraphElement | null
    ) {

        if (!paragraph) {
            return;
        }

        this.setDOMPosition(
            paragraph,
            0
        );

    }

    setCaret(
        paragraphId: number,
        offset: number
    ) {

        this.controller.setCaret(
            paragraphId,
            offset
        );

        this.renderSelection();

    }

    // ================================================================
    // SELECTION
    // ================================================================

    setSelection(
        anchorParagraphId: number,
        anchorOffset: number,
        focusParagraphId: number,
        focusOffset: number
    ) {

        this.controller.setSelection(
            {
                paragraphId: anchorParagraphId,
                offset: anchorOffset,
            },
            {
                paragraphId: focusParagraphId,
                offset: focusOffset,
            }
        );

        this.renderSelection();

    }

    extendSelection(
        paragraphId: number,
        offset: number
    ) {

        const anchor =
            this.controller.getAnchor();

        if (!anchor) {

            this.setCaret(
                paragraphId,
                offset
            );

            return;

        }

        this.controller.setSelection(
            anchor,
            {
                paragraphId,
                offset,
            }
        );

        this.renderSelection();

    }

    setFocus(
        paragraphId: number,
        offset: number
    ) {

        const anchor =
            this.controller.getAnchor();

        if (!anchor) {
            return;
        }

        this.controller.setSelection(
            anchor,
            {
                paragraphId,
                offset,
            }
        );

        this.renderSelection();

    }

    // ================================================================
    // SAVE / RESTORE
    // ================================================================

    save(): SelectionSnapshot | undefined {

        const state =
            this.controller.getState();

        if (!state) {
            return;
        }

        return {

            anchorParagraphId:
                state.anchor.paragraphId,

            anchorOffset:
                state.anchor.offset,

            focusParagraphId:
                state.focus.paragraphId,

            focusOffset:
                state.focus.offset,

        };

    }

    restore(
        snapshot: SelectionSnapshot | null
    ) {

        if (!snapshot) {
            return;
        }

        this.controller.setSelection(
            {
                paragraphId:
                    snapshot.anchorParagraphId,

                offset:
                    snapshot.anchorOffset,
            },
            {
                paragraphId:
                    snapshot.focusParagraphId,

                offset:
                    snapshot.focusOffset,
            }
        );

        this.renderSelection();

    }

    // ================================================================
    // GETTERS
    // ================================================================

    getCaretOffset(): number {

        return this.controller
            .getFocus()
            ?.offset ?? 0;

    }

    getFocusParagraphId(): number | null {

        return this.controller
            .getFocus()
            ?.paragraphId ?? null;

    }

    getFocusOffset(): number {

        return this.controller
            .getFocus()
            ?.offset ?? 0;

    }

    // getCurrentSelection //
    getCurrentSelection(): SelectionRange | null {

        const state =
            this.controller.getState();

        if (!state) {
            return null;
        }

        return {

            anchor: {
                ...state.anchor,
            },

            focus: {
                ...state.focus,
            },

        };

    }

    // ================================================================
    // HAS SELECTION
    // ================================================================

    hasSelection(): boolean {

        const state =
            this.controller.getState();

        if (!state) {

            return false;

        }

        return (

            state.anchor.paragraphId !==
                state.focus.paragraphId

            ||

            state.anchor.offset !==
                state.focus.offset

        );

    }

    // getCurrentParagraphID
    getCurrentParagraphId(): number | null {

        return this.controller
            .getFocus()
            ?.paragraphId ?? null;

    }

    // ================================================================
    // CARET BOUNDARIES
    // ================================================================

    isCaretAtStart(): boolean {

        const focus =
            this.controller.getFocus();

        return !!focus &&
            focus.offset === 0;

    }

    isCaretAtEnd(): boolean {

        const focus =
            this.controller.getFocus();

        if (!focus) {
            return false;
        }

        const paragraph =
            this.getParagraphElement(
                focus.paragraphId
            );

        if (!paragraph) {
            return false;
        }

        return (
            focus.offset ===
            this.getParagraphTextLength(
                paragraph
            )
        );

    }

    // ================================================================
    // PARAGRAPH NAVIGATION
    // ================================================================

    // getPreviousParagraph //
    getPreviousParagraph(): HTMLParagraphElement | null {

        const id = this.getCurrentParagraphId();

        if (id === null) {
            return null;
        }

        const current =
            this.getParagraphElement(id);

        if (!current) {
            return null;
        }

        const previous =
            current.previousElementSibling;

        return previous instanceof HTMLParagraphElement
            ? previous
            : null;
    }

    // getPreviousParagraphFrom //
    getPreviousParagraphFrom(
        paragraphId: number
    ): HTMLParagraphElement | null {

        const current =
            this.getParagraphElement(paragraphId);

        if (!current) {
            return null;
        }

        const previous =
            current.previousElementSibling;

        return previous instanceof HTMLParagraphElement
            ? previous
            : null;
    }

    // getNextParagraph //
    getNextParagraph(): HTMLParagraphElement | null {

        const id = this.getCurrentParagraphId();

        if (id === null) {
            return null;
        }

        const current =
            this.getParagraphElement(id);

        if (!current) {
            return null;
        }

        const next =
            current.nextElementSibling;

        return next instanceof HTMLParagraphElement
            ? next
            : null;
    }

    // getNextParagraphFrom //
    getNextParagraphFrom(
        paragraphId: number
    ): HTMLParagraphElement | null {

        const current =
            this.getParagraphElement(paragraphId);

        if (!current) {
            return null;
        }

        const next =
            current.nextElementSibling;

        return next instanceof HTMLParagraphElement
            ? next
            : null;
    }

    getCaretColumn(): number {

        return this.getCaretOffset();

    }

    // ================================================================
    // ORDERED SELECTION
    // ================================================================

    getOrderedSelection():
        OrderedSelectionRange | null {

        const state =
            this.controller.getState();

        if (!state) {
            return null;
        }

        const {
            anchor,
            focus
        } = state;

        /*
        IMPORTANTE:

        Não podemos comparar IDs numericamente para determinar
        qual parágrafo vem primeiro.

        O ID pode ser Date.now(), mas a ordem do documento é
        responsabilidade do DOM/DocumentModel.

        Portanto usamos a ordem dos <p>s.
        */

        if (
            anchor.paragraphId !==
            focus.paragraphId
        ) {

            const paragraphs =
                this.getParagraphElements();

            const anchorIndex =
                paragraphs.findIndex(
                    p =>
                        Number(p.dataset.id) ===
                        anchor.paragraphId
                );

            const focusIndex =
                paragraphs.findIndex(
                    p =>
                        Number(p.dataset.id) ===
                        focus.paragraphId
                );

            if (
                anchorIndex === -1 ||
                focusIndex === -1
            ) {

                return null;

            }

            if (anchorIndex < focusIndex) {

                return {
                    start: anchor,
                    end: focus,
                };

            }

            return {
                start: focus,
                end: anchor,
            };

        }

        if (anchor.offset <= focus.offset) {

            return {
                start: anchor,
                end: focus,
            };

        }

        return {
            start: focus,
            end: anchor,
        };

    }

    // ================================================================
    // MULTI PARAGRAPH SELECTION
    // ================================================================

    isMultiParagraphSelection(): boolean {

        const selection =
            this.getOrderedSelection();

        if (!selection) {
            return false;
        }

        return (
            selection.start.paragraphId !==
            selection.end.paragraphId
        );

    }

    getMultiParagraphSelection():
        MultiParagraphSelection | null {

        const selection =
            this.getOrderedSelection();

        if (!selection) {
            return null;
        }

        if (
            selection.start.paragraphId ===
            selection.end.paragraphId
        ) {

            return null;

        }

        const paragraphs =
            this.getParagraphElements();

        const startIndex =
            paragraphs.findIndex(
                paragraph =>
                    Number(paragraph.dataset.id) ===
                    selection.start.paragraphId
            );

        const endIndex =
            paragraphs.findIndex(
                paragraph =>
                    Number(paragraph.dataset.id) ===
                    selection.end.paragraphId
            );

        if (
            startIndex === -1 ||
            endIndex === -1
        ) {

            return null;

        }

        const selectedParagraphs =
            paragraphs
                .slice(
                    startIndex,
                    endIndex + 1
                )
                .map(paragraph => ({

                    id:
                        Number(
                            paragraph.dataset.id
                        ),

                    content:
                        paragraph.textContent ?? "",

                }));

        return {

            startParagraphId:
                selection.start.paragraphId,

            endParagraphId:
                selection.end.paragraphId,

            startOffset:
                selection.start.offset,

            endOffset:
                selection.end.offset,

            paragraphs:
                selectedParagraphs,

        };

    }

    isSingleParagraphSelection(): boolean {

        return !this.isMultiParagraphSelection();

    }

    // ================================================================
    // SELECTED TEXT
    // ================================================================

    getSelectedText(): string {

        const selection =
            this.getOrderedSelection();

        if (!selection) {
            return "";
        }

        const paragraphs =
            this.getParagraphElements();

        const startIndex =
            paragraphs.findIndex(
                p =>
                    Number(p.dataset.id) ===
                    selection.start.paragraphId
            );

        const endIndex =
            paragraphs.findIndex(
                p =>
                    Number(p.dataset.id) ===
                    selection.end.paragraphId
            );

        if (
            startIndex === -1 ||
            endIndex === -1
        ) {

            return "";

        }

        if (startIndex === endIndex) {

            const text =
                paragraphs[startIndex]
                    .textContent ?? "";

            return text.slice(
                selection.start.offset,
                selection.end.offset
            );

        }

        const result: string[] = [];

        for (
            let i = startIndex;
            i <= endIndex;
            i++
        ) {

            const text =
                paragraphs[i]
                    .textContent ?? "";

            if (i === startIndex) {

                result.push(
                    text.slice(
                        selection.start.offset
                    )
                );

            } else if (i === endIndex) {

                result.push(
                    text.slice(
                        0,
                        selection.end.offset
                    )
                );

            } else {

                result.push(text);

            }

        }

        return result.join("\n");

    }

    // ================================================================
    // PARAGRAPH ELEMENTS
    // ================================================================

    private getParagraphElements():
        HTMLParagraphElement[] {

        return Array.from(
            document.querySelectorAll(
                "p[data-id]"
            )
        ) as HTMLParagraphElement[];

    }

    // ================================================================
    // DOM POSITION
    // ================================================================

    private setDOMPosition(
        paragraph: HTMLParagraphElement,
        logicalOffset: number
    ) {

        const selection =
            window.getSelection();

        if (!selection) {
            return;
        }

        const position =
            this.logicalOffsetToDOM(
                paragraph,
                logicalOffset
            );

        const range =
            document.createRange();

        range.setStart(
            position.node,
            position.offset
        );

        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);

    }

    // ================================================================
    // APPLY SELECTION
    // ================================================================

    private applySelection(
        anchorParagraphId: number,
        anchorOffset: number,
        focusParagraphId: number,
        focusOffset: number
    ) {

        const selection =
            window.getSelection();

        if (!selection) {
            return;
        }

        const anchorParagraph =
            this.getParagraphElement(
                anchorParagraphId
            );

        const focusParagraph =
            this.getParagraphElement(
                focusParagraphId
            );

        if (
            !anchorParagraph ||
            !focusParagraph
        ) {
            return;
        }

        const anchorPoint =
            this.getDomPointFromOffset(
                anchorParagraph,
                anchorOffset
            );

        const focusPoint =
            this.getDomPointFromOffset(
                focusParagraph,
                focusOffset
            );

        if (
            !anchorPoint ||
            !focusPoint
        ) {
            return;
        }

        selection.removeAllRanges();

        // =====================================================
        // APENAS CARET
        // =====================================================

        if (
            anchorParagraphId === focusParagraphId &&
            anchorOffset === focusOffset
        ) {

            const range =
                document.createRange();

            range.setStart(
                anchorPoint.node,
                anchorPoint.offset
            );

            range.collapse(true);

            selection.addRange(range);

            return;
        }

        // =====================================================
        // SELEÇÃO REAL
        // =====================================================

        selection.setBaseAndExtent(

            anchorPoint.node,
            anchorPoint.offset,

            focusPoint.node,
            focusPoint.offset

        );
    }
    // ================================================================
    // SELECTION DIRECTION
    // ================================================================

    isSelectionBackward(): boolean {

        const selection =
            this.getSelection();

        if (
            !selection ||
            selection.rangeCount === 0
        ) {

            return false;

        }

        const range =
            selection.getRangeAt(0);

        return (
            selection.focusNode ===
                range.startContainer &&

            selection.focusOffset ===
                range.startOffset
        );

    }

    // ================================================================
    // ANCHOR / FOCUS
    // ================================================================

    getAnchor() {

        return this.controller.getAnchor();

    }

    getFocus() {

        return this.controller.getFocus();

    }

    // ================================================================
    // RENDER SELECTION
    // ================================================================

    private renderSelection() {

        const state =
            this.controller.getState();

        if (!state) {
            return;
        }

        this.applySelection(

            state.anchor.paragraphId,
            state.anchor.offset,

            state.focus.paragraphId,
            state.focus.offset

        );

    }

    // ================================================================
    // SYNC DOM → CONTROLLER
    // ================================================================

    syncControllerFromDOM() {

        const selection =
            window.getSelection();

        if (
            !selection ||
            selection.rangeCount === 0
        ) {

            return;

        }

        const anchorParagraph =
            this.findParagraph(
                selection.anchorNode
            );

        const focusParagraph =
            this.findParagraph(
                selection.focusNode
            );

        if (
            !anchorParagraph ||
            !focusParagraph
        ) {

            return;

        }

        const anchorOffset =
            this.getParagraphOffsetFromDomPoint(
                anchorParagraph,
                selection.anchorNode!,
                selection.anchorOffset
            );

        const focusOffset =
            this.getParagraphOffsetFromDomPoint(
                focusParagraph,
                selection.focusNode!,
                selection.focusOffset
            );

        this.controller.setSelection(

            {
                paragraphId:
                    Number(anchorParagraph.dataset.id),

                offset:
                    anchorOffset
            },

            {
                paragraphId:
                    Number(focusParagraph.dataset.id),

                offset:
                    focusOffset
            }

        );

    }

    // ================================================================
    // DOM CARET
    // ================================================================

    getDOMCaretOffset(): number {

        const selection =
            window.getSelection();

        if (
            !selection ||
            selection.rangeCount === 0 ||
            !selection.focusNode
        ) {

            return 0;

        }

        const paragraph =
            this.findParagraph(
                selection.focusNode
            );

        if (!paragraph) {
            return 0;
        }

        return this.domOffsetToLogical(

            paragraph,

            selection.focusNode,

            selection.focusOffset

        );

    }

    // ================================================================
    // DOM PARAGRAPH
    // ================================================================

    getDOMParagraphId(): number | null {

        const selection =
            window.getSelection();

        if (
            !selection ||
            selection.rangeCount === 0
        ) {

            return null;

        }

        const paragraph =
            this.findParagraph(
                selection.focusNode
            );

        if (!paragraph) {
            return null;
        }

        return Number(
            paragraph.dataset.id
        );

    }

    // ================================================================
    // DOCUMENT SELECTION
    // ================================================================

    selectToDocumentStart() {

        const anchor =
            this.controller.getAnchor();

        if (!anchor) {
            return;
        }

        const paragraphs =
            this.getParagraphElements();

        if (paragraphs.length === 0) {
            return;
        }

        const first =
            paragraphs[0];

        this.setSelection(

            anchor.paragraphId,
            anchor.offset,

            Number(first.dataset.id),
            0

        );

    }

    selectToDocumentEnd() {

        const anchor =
            this.controller.getAnchor();

        if (!anchor) {
            return;
        }

        const paragraphs =
            this.getParagraphElements();

        if (paragraphs.length === 0) {
            return;
        }

        const last =
            paragraphs[paragraphs.length - 1];

        const end =
            this.getParagraphTextLength(
                last
            );

        this.setSelection(

            anchor.paragraphId,
            anchor.offset,

            Number(last.dataset.id),
            end

        );

    }

    // ==============================
    // NOVO
    // ==============================
    private getDomPointFromOffset(
    paragraph: HTMLParagraphElement,
        offset: number
    ): { node: Text; offset: number } | null {

        const walker = document.createTreeWalker(
            paragraph,
            NodeFilter.SHOW_TEXT
        );

        let currentOffset = 0;

        let node: Text | null;

        while ((node = walker.nextNode() as Text | null)) {

            const length = node.length;

            if (
                offset >= currentOffset &&
                offset <= currentOffset + length
            ) {

                return {
                    node,
                    offset: offset - currentOffset
                };

            }

            currentOffset += length;

        }

        // parágrafo vazio
        const fallback = document.createTextNode("");

        paragraph.appendChild(fallback);

        return {
            node: fallback,
            offset: 0
        };

    }

    private getParagraphOffsetFromDomPoint(
        paragraph: HTMLParagraphElement,
        node: Node,
        offset: number
    ): number {

        const range = document.createRange();

        range.setStart(paragraph, 0);
        range.setEnd(node, offset);

        return range.toString().length;

    }

    // =========================
    // CTRL + A
    // =========================
    public selectAll() {

        const paragraphs =
            this.getParagraphElements();

        if (paragraphs.length === 0) {
            return;
        }

        const first =
            paragraphs[0];

        const last =
            paragraphs[paragraphs.length - 1];

        const firstId =
            Number(first.dataset.id);

        const lastId =
            Number(last.dataset.id);

        const lastOffset =
            last.textContent?.length ?? 0;

        this.setSelection(
            firstId,
            0,
            lastId,
            lastOffset
        );

    }

}