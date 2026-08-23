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

    // getParagraphElement //
    private getParagraphElement(
        id: number
    ): HTMLParagraphElement | null {

        return document.querySelector(
            `p[data-paragraph-id="${id}"]`
        ) as HTMLParagraphElement | null;

    }

    // getParagraphFragments //
    private getParagraphFragments(
        paragraphId: number
    ): HTMLParagraphElement[] {

        const all =
            Array.from(
                document.querySelectorAll(
                    `p[data-paragraph-id="${paragraphId}"], p[data-id="${paragraphId}"]`
                )
            ) as HTMLParagraphElement[];

        // Remove possíveis duplicados
        const unique =
            Array.from(
                new Set(all)
            );

        // Garante a ordem visual/lógica
        unique.sort(
            (a, b) => {

                const startA =
                    Number(
                        a.dataset.startOffset ?? 0
                    );

                const startB =
                    Number(
                        b.dataset.startOffset ?? 0
                    );

                return startA - startB;

            }
        );

        return unique;

    }

    // getLogicalParagraphLength //
    private getLogicalParagraphLength(
        paragraphId: number
    ): number {

        const fragments =
            this.getParagraphFragments(
                paragraphId
            );

        if (fragments.length === 0) {
            return 0;
        }

        let length = 0;

        for (const fragment of fragments) {

            const start =
                Number(
                    fragment.dataset.startOffset ?? 0
                );

            const end =
                Number(
                    fragment.dataset.endOffset ??
                    start +
                    (fragment.textContent?.length ?? 0)
                );

            length =
                Math.max(
                    length,
                    end
                );

        }

        return length;

    }

    // getParagraphLogicalLength //
    public getParagraphLogicalLength(
        paragraphId: number
    ): number {

        return this.getLogicalParagraphLength(
            paragraphId
        );

    }

    // getFirstParagraphFragment //
    private getFirstParagraphFragment(
        paragraphId: number
    ): HTMLParagraphElement | null {

        const fragments =
            this.getParagraphFragments(
                paragraphId
            );

        return fragments[0] ?? null;

    }

    // findParagraph //
    private findParagraph(
        node: Node | null
    ): HTMLParagraphElement | null {

        while (node) {

            if (
                node instanceof HTMLParagraphElement &&
                (
                    node.dataset.id ||
                    node.dataset.paragraphId
                )
            ) {

                return node;

            }

            node = node.parentNode;

        }

        return null;

    }

    // getParagraphTextLength //
    private getParagraphTextLength(
        paragraph: HTMLParagraphElement
    ): number {

        const paragraphId =
            paragraph.dataset.paragraphId ??
            paragraph.dataset.id;

        if (!paragraphId) {

            return paragraph.textContent?.length ?? 0;

        }

        const fragments =
            Array.from(
                document.querySelectorAll(
                    `p[data-paragraph-id="${paragraphId}"]`
                )
            ) as HTMLParagraphElement[];

        if (fragments.length === 0) {

            return paragraph.textContent?.length ?? 0;

        }

        let length = 0;

        for (const fragment of fragments) {

            const endOffset =
                Number(
                    fragment.dataset.endOffset
                );

            if (Number.isFinite(endOffset)) {

                length =
                    Math.max(
                        length,
                        endOffset
                    );

            } else {

                length +=
                    fragment.textContent?.length ?? 0;

            }

        }

        return length;

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

        requestAnimationFrame(() => {

            this.ensureCaretVisible();

        });

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

        console.log("[SET SELECTION BEFORE]", {
            anchorParagraphId,
            anchorOffset,
            focusParagraphId,
            focusOffset
        });

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

        console.log(
            "[SET SELECTION CONTROLLER]",
            this.controller.getState()
        );

        this.renderSelection();

        console.log(
            "[SET SELECTION AFTER]",
            this.controller.getState()
        );

    }

    // extendSelection //
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

    // getParagraphLength //
    getParagraphLength(
        paragraphId: number
    ): number {

        const paragraph =
            this.getParagraphElement(
                paragraphId
            );

        if (!paragraph) {

            return 0;

        }

        return this.getParagraphTextLength(
            paragraph
        );

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

        const ids =
            this.getLogicalParagraphIds();

        const index =
            ids.indexOf(id);

        if (
            index <= 0
        ) {

            return null;

        }

        return this.getParagraphElement(
            ids[index - 1]
        );

    }

    // getPreviousParagraphFrom //
    getPreviousParagraphFrom(
        paragraphId: number
    ): HTMLParagraphElement | null {

        const paragraphs =
            this.getParagraphElements();

        const index =
            paragraphs.findIndex(
                paragraph =>
                    Number(
                        paragraph.dataset.id
                    ) === paragraphId
            );

        if (
            index <= 0
        ) {

            return null;

        }

        return paragraphs[
            index - 1
        ];

    }

    // getNextParagraph //
    getNextParagraph(): HTMLParagraphElement | null {

        const id = this.getCurrentParagraphId();

        if (id === null) {
            return null;
        }

        const ids =
            this.getLogicalParagraphIds();

        const index =
            ids.indexOf(id);

        if (
            index === -1 ||
            index >= ids.length - 1
        ) {

            return null;

        }

        return this.getParagraphElement(
            ids[index + 1]
        );

    }

    // getNextParagraphFrom //
    getNextParagraphFrom(
        paragraphId: number
    ): HTMLParagraphElement | null {

        const ids =
            this.getLogicalParagraphIds();

        const index =
            ids.indexOf(paragraphId);

        if (
            index === -1 ||
            index >= ids.length - 1
        ) {

            return null;

        }

        const nextParagraphId =
            ids[index + 1];

        return this.getParagraphElement(
            nextParagraphId
        );

    }
    // ----------------------------- //

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
                "p[data-paragraph-id]"
            )
        ) as HTMLParagraphElement[];

    }

    // getLogicalParagraphIds //
    private getLogicalParagraphIds(): number[] {

        const fragments =
            this.getParagraphElements();

        const ids: number[] = [];

        for (const fragment of fragments) {

            const id =
                Number(
                    fragment.dataset.paragraphId
                );

            if (
                !Number.isFinite(id)
            ) {

                continue;

            }

            if (
                !ids.includes(id)
            ) {

                ids.push(id);

            }

        }

        return ids;

    }

    // ================================================================
    // DOM POSITION
    // ================================================================

    private getParagraphFragmentForOffset(
        paragraphId: number,
        logicalOffset: number
    ): HTMLParagraphElement | null {

        const fragments =
            this.getParagraphFragments(
                paragraphId
            );

        if (fragments.length === 0) {

            return null;

        }

        for (const fragment of fragments) {

            const start =
                Number(
                    fragment.dataset.startOffset ?? 0
                );

            const end =
                Number(
                    fragment.dataset.endOffset ?? 0
                );

            if (
                logicalOffset >= start &&
                logicalOffset <= end
            ) {

                return fragment;

            }

        }

        return fragments[
            fragments.length - 1
        ];

    }
    // ----------------------------------------------- //

    // getVisualFragmentForOffset //
    public getVisualFragmentForOffset(
        paragraphId: number,
        logicalOffset: number
    ): HTMLParagraphElement | null {

        const fragments =
            this.getParagraphFragments(
                paragraphId
            );

        if (fragments.length === 0) {
            return null;
        }

        for (const fragment of fragments) {

            const start =
                Number(
                    fragment.dataset.startOffset ?? 0
                );

            const end =
                Number(
                    fragment.dataset.endOffset ??
                    start +
                    (fragment.textContent?.length ?? 0)
                );

            if (
                logicalOffset >= start &&
                (
                    logicalOffset < end ||
                    (
                        logicalOffset === end &&
                        fragment === fragments[fragments.length - 1]
                    )
                )
            ) {

                return fragment;

            }

        }

        return fragments[
            fragments.length - 1
        ];

    }

    // getPreviousVisualFragment //
    public getPreviousVisualFragment(
        paragraphId: number,
        logicalOffset: number
    ): HTMLParagraphElement | null {

        const fragments =
            this.getParagraphFragments(
                paragraphId
            );

        if (fragments.length <= 1) {
            return null;
        }

        const current =
            this.getVisualFragmentForOffset(
                paragraphId,
                logicalOffset
            );

        if (!current) {
            return null;
        }

        const currentIndex =
            fragments.indexOf(current);

        if (currentIndex <= 0) {
            return null;
        }

        return fragments[
            currentIndex - 1
        ];

    }

    // getNextVisualFragment //
    public getNextVisualFragment(
        paragraphId: number,
        logicalOffset: number
    ): HTMLParagraphElement | null {

        const fragments =
            this.getParagraphFragments(
                paragraphId
            );

        if (fragments.length <= 1) {
            return null;
        }

        const current =
            this.getVisualFragmentForOffset(
                paragraphId,
                logicalOffset
            );

        if (!current) {
            return null;
        }

        const currentIndex =
            fragments.indexOf(current);

        if (
            currentIndex === -1 ||
            currentIndex >= fragments.length - 1
        ) {
            return null;
        }

        return fragments[
            currentIndex + 1
        ];

    }

    // ================================================================
    // PRIMEIRO FRAGMENTO VISUAL DE UM PARÁGRAFO
    // ================================================================

    public getFirstVisualFragment(
        paragraphId: number
    ): HTMLParagraphElement | null {

        const fragments =
            this.getParagraphFragments(
                paragraphId
            );

        return fragments[0] ?? null;
    }


    // ================================================================
    // ÚLTIMO FRAGMENTO VISUAL DE UM PARÁGRAFO
    // ================================================================

    public getLastVisualFragment(
        paragraphId: number
    ): HTMLParagraphElement | null {

        const fragments =
            this.getParagraphFragments(
                paragraphId
            );

        return fragments[
            fragments.length - 1
        ] ?? null;
    }

    // setDOMPosition //
    private setDOMPosition(
        paragraph: HTMLParagraphElement,
        logicalOffset: number
    ) {

        const selection =
            window.getSelection();

        if (!selection) {
            return;
        }

        const paragraphId =
            Number(
                paragraph.dataset.paragraphId ??
                paragraph.dataset.id
            );

        const fragment =
            this.getParagraphFragmentForOffset(
                paragraphId,
                logicalOffset
            );

        if (!fragment) {
            return;
        }

        const fragmentStart =
            Number(
                fragment.dataset.startOffset ?? 0
            );

        const localOffset =
            Math.max(
                0,
                logicalOffset -
                fragmentStart
            );

        const position =
            this.logicalOffsetToDOM(
                fragment,
                localOffset
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
    // ENCONTRAR OFFSET VISUALMENTE MAIS PRÓXIMO
    // ================================================================

    public getClosestOffsetInFragment(
        fragment: HTMLParagraphElement,
        targetX: number,
        targetY: number
    ): number {

        const walker =
            document.createTreeWalker(
                fragment,
                NodeFilter.SHOW_TEXT
            );

        const textNodes: Text[] = [];

        let node: Node | null;

        while (
            node = walker.nextNode()
        ) {

            textNodes.push(
                node as Text
            );

        }

        if (textNodes.length === 0) {

            return 0;

        }

        /*
        * ============================================================
        * ETAPA 1
        *
        * Encontrar todas as posições possíveis do caret.
        *
        * Cada posição recebe:
        *
        * - offset local
        * - X
        * - Y
        *
        * Assim conseguimos identificar as linhas reais do DOM.
        * ============================================================
        */

        interface CaretCandidate {

            offset: number;

            x: number;

            y: number;

        }

        const candidates:
            CaretCandidate[] = [];

        for (const textNode of textNodes) {

            for (
                let i = 0;
                i <= textNode.length;
                i++
            ) {

                const range =
                    document.createRange();

                try {

                    range.setStart(
                        textNode,
                        i
                    );

                    range.collapse(true);

                } catch {

                    continue;

                }

                const rect =
                    range.getBoundingClientRect();

                if (
                    rect.width === 0 &&
                    rect.height === 0
                ) {

                    const clientRects =
                        range.getClientRects();

                    if (
                        clientRects.length === 0
                    ) {

                        continue;

                    }

                    const fallback =
                        clientRects[
                            clientRects.length - 1
                        ];

                    candidates.push({

                        offset:
                            this.getLocalOffsetFromDomPoint(
                                fragment,
                                textNode,
                                i
                            ),

                        x:
                            fallback.left,

                        y:
                            fallback.top,

                    });

                    continue;

                }

                candidates.push({

                    offset:
                        this.getLocalOffsetFromDomPoint(
                            fragment,
                            textNode,
                            i
                        ),

                    x:
                        rect.left,

                    y:
                        rect.top,

                });

            }

        }

        if (candidates.length === 0) {

            return 0;

        }

        /*
        * ============================================================
        * ETAPA 2
        *
        * Encontrar a linha visual mais próxima.
        *
        * Não usamos simplesmente o menor Y.
        *
        * Agrupamos posições que pertencem à mesma linha.
        * ============================================================
        */

        const lineTolerance = 3;

        interface VisualLine {

            y: number;

            candidates: CaretCandidate[];

        }

        const lines: VisualLine[] = [];

        for (const candidate of candidates) {

            let line =
                lines.find(
                    existing =>
                        Math.abs(
                            existing.y -
                            candidate.y
                        ) <= lineTolerance
                );

            if (!line) {

                line = {

                    y:
                        candidate.y,

                    candidates:
                        [],

                };

                lines.push(line);

            }

            line.candidates.push(
                candidate
            );

        }

        /*
        * Ordena as linhas visualmente.
        */

        lines.sort(
            (a, b) =>
                a.y - b.y
        );

        /*
        * ============================================================
        * ETAPA 3
        *
        * Encontrar a linha cuja posição vertical é mais próxima
        * de targetY.
        * ============================================================
        */

        let closestLine:
            VisualLine | null = null;

        let closestVerticalDistance =
            Infinity;

        for (const line of lines) {

            const distance =
                Math.abs(
                    line.y -
                    targetY
                );

            if (
                distance <
                closestVerticalDistance
            ) {

                closestVerticalDistance =
                    distance;

                closestLine =
                    line;

            }

        }

        if (!closestLine) {

            return 0;

        }

        /*
        * ============================================================
        * ETAPA 4
        *
        * Dentro da linha correta, procurar a posição horizontal
        * mais próxima.
        * ============================================================
        */

        let bestCandidate =
            closestLine.candidates[0];

        let bestHorizontalDistance =
            Math.abs(
                bestCandidate.x -
                targetX
            );

        for (
            let i = 1;
            i < closestLine.candidates.length;
            i++
        ) {

            const candidate =
                closestLine.candidates[i];

            const horizontalDistance =
                Math.abs(
                    candidate.x -
                    targetX
                );

            if (
                horizontalDistance <
                bestHorizontalDistance
            ) {

                bestHorizontalDistance =
                    horizontalDistance;

                bestCandidate =
                    candidate;

            }

        }

        return bestCandidate.offset;

    }

    // ================================================================
    // POSIÇÃO VERTICAL DO CARET DENTRO DO FRAGMENTO
    // ================================================================

    public getCaretLinePosition(
        fragment: HTMLParagraphElement
    ): {
        lineIndex: number;
        lineCount: number;
    } | null {

        const selection =
            window.getSelection();

        if (
            !selection ||
            !selection.focusNode
        ) {
            return null;
        }

        const caretRange =
            document.createRange();

        try {

            caretRange.setStart(
                selection.focusNode,
                selection.focusOffset
            );

            caretRange.collapse(true);

        } catch {

            return null;

        }

        const caretRect =
            caretRange.getBoundingClientRect();

        if (
            caretRect.height === 0
        ) {
            return null;
        }

        const walker =
            document.createTreeWalker(
                fragment,
                NodeFilter.SHOW_TEXT
            );

        const lines: number[] = [];

        let node: Node | null;

        while (
            node =
                walker.nextNode()
        ) {

            const textNode =
                node as Text;

            for (
                let i = 0;
                i <= textNode.length;
                i++
            ) {

                const range =
                    document.createRange();

                range.setStart(
                    textNode,
                    i
                );

                range.collapse(true);

                const rect =
                    range.getBoundingClientRect();

                if (
                    rect.width === 0 &&
                    rect.height === 0
                ) {
                    continue;
                }

                const top =
                    Math.round(rect.top);

                if (
                    !lines.includes(top)
                ) {

                    lines.push(top);

                }

            }

        }

        if (lines.length === 0) {
            return null;
        }

        lines.sort(
            (a, b) => a - b
        );

        let closestLine = 0;

        let closestDistance =
            Infinity;

        for (
            let i = 0;
            i < lines.length;
            i++
        ) {

            const distance =
                Math.abs(
                    lines[i] -
                    caretRect.top
                );

            if (
                distance <
                closestDistance
            ) {

                closestDistance =
                    distance;

                closestLine =
                    i;

            }

        }

        return {

            lineIndex:
                closestLine,

            lineCount:
                lines.length,

        };

    }

    // getCaretVisualPosition //
    public getCaretVisualPosition(): {
        x: number;
        y: number;
    } | null {

        const selection =
            window.getSelection();

        if (
            !selection ||
            selection.rangeCount === 0 ||
            !selection.focusNode
        ) {

            return null;

        }

        const range =
            selection.getRangeAt(0);

        /*
        * Precisamos de uma range colapsada
        * exatamente na posição do caret.
        */

        const caretRange =
            document.createRange();

        try {

            caretRange.setStart(
                selection.focusNode,
                selection.focusOffset
            );

            caretRange.collapse(true);

        } catch {

            return null;

        }

        const rect =
            caretRange.getBoundingClientRect();

        /*
        * Alguns browsers podem retornar um rect
        * vazio para o caret.
        */

        if (
            rect.width === 0 &&
            rect.height === 0
        ) {

            const clientRects =
                caretRange.getClientRects();

            if (
                clientRects.length > 0
            ) {

                const fallback =
                    clientRects[
                        clientRects.length - 1
                    ];

                return {
                    x: fallback.left,
                    y: fallback.top,
                };

            }

        }

        return {
            x: rect.left,
            y: rect.top,
        };

    }

    // ================================================================
    // GARANTIR QUE O CARET FIQUE VISÍVEL
    // ================================================================

    private ensureCaretVisible(): void {

        const selection =
            window.getSelection();

        if (
            !selection ||
            selection.rangeCount === 0 ||
            !selection.focusNode
        ) {
            return;
        }

        const range =
            document.createRange();

        try {

            range.setStart(
                selection.focusNode,
                selection.focusOffset
            );

            range.collapse(true);

        } catch {

            return;

        }

        let rect =
            range.getBoundingClientRect();

        // ------------------------------------------------------------
        // Alguns browsers podem retornar um rect vazio para o caret.
        // ------------------------------------------------------------

        if (
            rect.width === 0 &&
            rect.height === 0
        ) {

            const rects =
                range.getClientRects();

            if (rects.length > 0) {

                rect =
                    rects[rects.length - 1];

            }

        }

        if (
            rect.width === 0 &&
            rect.height === 0
        ) {
            return;
        }

        // ------------------------------------------------------------
        // Procura o primeiro elemento rolável acima do caret.
        // ------------------------------------------------------------

        let element: HTMLElement | null =
            selection.focusNode.nodeType === Node.ELEMENT_NODE

                ? selection.focusNode as HTMLElement

                : selection.focusNode.parentElement;

        while (element) {

            const style =
                getComputedStyle(element);

            const isScrollable =
                (
                    element.scrollHeight >
                    element.clientHeight
                ) &&
                (
                    style.overflowY === "auto" ||
                    style.overflowY === "scroll"
                );

            if (isScrollable) {
                break;
            }

            element =
                element.parentElement;

        }

        // ------------------------------------------------------------
        // Não encontrou container interno.
        // Usa o viewport.
        // ------------------------------------------------------------

        if (!element) {

            const viewportTop =
                0;

            const viewportBottom =
                window.innerHeight;

            const margin = 30;

            if (
                rect.top <
                viewportTop + margin
            ) {

                window.scrollBy(
                    0,
                    rect.top -
                    viewportTop -
                    margin
                );

            } else if (
                rect.bottom >
                viewportBottom - margin
            ) {

                window.scrollBy(
                    0,
                    rect.bottom -
                    viewportBottom +
                    margin
                );

            }

            return;
        }

        // ------------------------------------------------------------
        // Container interno
        // ------------------------------------------------------------

        const containerRect =
            element.getBoundingClientRect();

        const margin = 30;

        // CARET ACIMA DA ÁREA VISÍVEL

        if (
            rect.top <
            containerRect.top + margin
        ) {

            element.scrollTop -=
                (
                    containerRect.top +
                    margin -
                    rect.top
                );

            return;
        }

        // CARET ABAIXO DA ÁREA VISÍVEL

        if (
            rect.bottom >
            containerRect.bottom - margin
        ) {

            element.scrollTop +=
                (
                    rect.bottom -
                    containerRect.bottom +
                    margin
                );

        }

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
            this.getParagraphFragmentForOffset(
                anchorParagraphId,
                anchorOffset
            );

        const focusParagraph =
            this.getParagraphFragmentForOffset(
                focusParagraphId,
                focusOffset
            );

        if (
            !anchorParagraph ||
            !focusParagraph
        ) {
            return;
        }

        const anchorPoint =
            this.getDomPointFromOffset(
                anchorParagraphId,
                anchorOffset
            );

        const focusPoint =
            this.getDomPointFromOffset(
                focusParagraphId,
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

        const anchorFragment =
            this.findParagraph(
                selection.anchorNode
            );

        const focusFragment =
            this.findParagraph(
                selection.focusNode
            );

        if (
            !anchorFragment ||
            !focusFragment
        ) {

            return;

        }

        const anchorParagraphId =
            this.getLogicalParagraphIdFromFragment(
                anchorFragment
            );

        const focusParagraphId =
            this.getLogicalParagraphIdFromFragment(
                focusFragment
            );

        if (
            anchorParagraphId === null ||
            focusParagraphId === null
        ) {

            return;

        }

        const anchorOffset =
            this.getLogicalOffsetFromFragment(
                anchorFragment,
                selection.anchorNode!,
                selection.anchorOffset
            );

        const focusOffset =
            this.getLogicalOffsetFromFragment(
                focusFragment,
                selection.focusNode!,
                selection.focusOffset
            );

        this.controller.setSelection(

            {
                paragraphId:
                    anchorParagraphId,

                offset:
                    anchorOffset,

            },

            {
                paragraphId:
                    focusParagraphId,

                offset:
                    focusOffset,

            }

        );

        console.log(
            "[SYNC DOM → CONTROLLER AFTER]",
            this.controller.getState()
        );

        console.log(
            "[SYNC DOM LOGICAL]",
            {
                anchor: {
                    paragraphId:
                        anchorParagraphId,
                    offset:
                        anchorOffset,
                },

                focus: {
                    paragraphId:
                        focusParagraphId,
                    offset:
                        focusOffset,
                },

                anchorFragment: {
                    start:
                        anchorFragment.dataset.startOffset,
                    end:
                        anchorFragment.dataset.endOffset,
                },

                focusFragment: {
                    start:
                        focusFragment.dataset.startOffset,
                    end:
                        focusFragment.dataset.endOffset,
                },
            }
        );

    }

    // getLogicalParagraphIdFromFragment //
    private getLogicalParagraphIdFromFragment(
        fragment: HTMLParagraphElement
    ): number | null {

        const id =
            fragment.dataset.paragraphId ??
            fragment.dataset.id;

        if (!id) {
            return null;
        }

        return Number(id);

    }

    // getLogicalOffsetFromFragment //
    private getLogicalOffsetFromFragment(
        fragment: HTMLParagraphElement,
        node: Node,
        offset: number
    ): number {

        const start =
            Number(
                fragment.dataset.startOffset ?? 0
            );

        const localOffset =
            this.getLocalOffsetFromDomPoint(
                fragment,
                node,
                offset
            );

        return start + localOffset;

    }

    // getLocalOffsetFromDomPoint //
    private getLocalOffsetFromDomPoint(
        fragment: HTMLParagraphElement,
        node: Node,
        offset: number
    ): number {

        const range =
            document.createRange();

        try {

            range.setStart(
                fragment,
                0
            );

            range.setEnd(
                node,
                offset
            );

            return range.toString().length;

        } catch {

            return 0;

        }

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

        const fragment =
            this.findParagraph(
                selection.focusNode
            );

        if (!fragment) {

            return 0;

        }

        return this.getLogicalOffsetFromFragment(

            fragment,

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
        paragraphId: number,
        offset: number
    ): {
        node: Text;
        offset: number;
    } | null {

        const fragments =
            this.getParagraphFragments(
                paragraphId
            );

        if (fragments.length === 0) {

            return null;

        }

        const logicalLength =
            this.getLogicalParagraphLength(
                paragraphId
            );

        const clampedOffset =
            Math.max(
                0,
                Math.min(
                    offset,
                    logicalLength
                )
            );

        // -------------------------------------------------
        // PROCURA O FRAGMENTO QUE CONTÉM O OFFSET
        // -------------------------------------------------

        for (const fragment of fragments) {

            const start =
                Number(
                    fragment.dataset.startOffset ?? 0
                );

            const end =
                Number(
                    fragment.dataset.endOffset ??
                    start +
                    (fragment.textContent?.length ?? 0)
                );

            if (
                clampedOffset >= start &&
                clampedOffset <= end
            ) {

                const localOffset =
                    clampedOffset - start;

                const walker =
                    document.createTreeWalker(
                        fragment,
                        NodeFilter.SHOW_TEXT
                    );

                let consumed = 0;

                let node:
                    Node | null;

                while (
                    node =
                        walker.nextNode()
                ) {

                    const textNode =
                        node as Text;

                    const length =
                        textNode.length;

                    if (
                        localOffset <=
                        consumed + length
                    ) {

                        return {

                            node: textNode,

                            offset:
                                localOffset -
                                consumed,

                        };

                    }

                    consumed += length;

                }

            }

        }

        // -------------------------------------------------
        // FALLBACK → ÚLTIMO FRAGMENTO
        // -------------------------------------------------

        const last =
            fragments[
                fragments.length - 1
            ];

        const walker =
            document.createTreeWalker(
                last,
                NodeFilter.SHOW_TEXT
            );

        let lastText: Text | null = null;

        let node:
            Node | null;

        while (
            node =
                walker.nextNode()
        ) {

            lastText =
                node as Text;

        }

        if (lastText) {

            return {

                node: lastText,

                offset: lastText.length,

            };

        }

        const fallback =
            document.createTextNode("");

        last.appendChild(
            fallback
        );

        return {

            node: fallback,

            offset: 0,

        };

    }
    // ---------------------------------------- //

    // getParagraphoffsetFromDomPoint //
    private getParagraphOffsetFromDomPoint(
        paragraph: HTMLParagraphElement,
        node: Node,
        offset: number
    ): number {

        const range =
            document.createRange();

        range.setStart(
            paragraph,
            0
        );

        range.setEnd(
            node,
            offset
        );

        const localOffset =
            range.toString().length;

        const fragmentStart =
            Number(
                paragraph.dataset.startOffset ?? 0
            );

        return (
            fragmentStart +
            localOffset
        );

    }

    // =========================
    // CTRL + A
    // =========================
    public selectAll() {

        console.log(
            "[CTRL+A] SelectionManager.selectAll CHAMADO"
        );

        const paragraphs =
            this.getParagraphElements();

        console.log(
            "[CTRL+A] fragments:",
            paragraphs.length
        );

        if (paragraphs.length === 0) {

            console.log(
                "[CTRL+A] NENHUM FRAGMENTO"
            );

            return;

        }

        const first =
            paragraphs[0];

        const last =
            paragraphs[paragraphs.length - 1];

        // =========================================================
        // IDs LÓGICOS
        // =========================================================

        const firstId =
            Number(
                first.dataset.paragraphId ??
                first.dataset.id
            );

        const lastId =
            Number(
                last.dataset.paragraphId ??
                last.dataset.id
            );

        if (
            !Number.isFinite(firstId) ||
            !Number.isFinite(lastId)
        ) {

            console.error(
                "[CTRL+A] IDs LÓGICOS INVÁLIDOS",
                {
                    first,
                    last,
                    firstId,
                    lastId
                }
            );

            return;

        }

        // =========================================================
        // OFFSET LÓGICO DO ÚLTIMO PARÁGRAFO
        // =========================================================

        const lastOffset =
            this.getLogicalParagraphLength(
                lastId
            );

        console.log(
            "[CTRL+A] range lógico:",
            {
                firstId,
                lastId,
                lastOffset
            }
        );

        // =========================================================
        // SELEÇÃO
        // =========================================================

        this.setSelection(

            firstId,
            0,

            lastId,
            lastOffset

        );

    }
    // ----------------------------------- //

}