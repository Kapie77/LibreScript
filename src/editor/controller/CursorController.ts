// CursorController.ts
// src/editor/controller/
import { EditorEngine } from "../engine/EditorEngine";
import { SelectionManager } from "../selection/SelectionManager";
import type { CaretSnapshot } from "../history/UndoData";
// -------------------------------------------------- //

export class CursorController {

    private root: HTMLDivElement;
    private engine: EditorEngine;
    private selection: SelectionManager;

    // CONSTRUCTOR //
    constructor(
        root: HTMLDivElement,
        engine: EditorEngine,
        selection: SelectionManager
    ) {

        this.root = root;
        this.engine = engine;
        this.selection = selection;

    }
    // -------------------- //

    attach() {

        this.root.addEventListener(

            "keydown",

            this.handleKeyDown

        );

    }

    detach() {

        this.root.removeEventListener(

            "keydown",

            this.handleKeyDown

        );

    }

    getCurrentParagraphElement(): HTMLParagraphElement | null {

        const selection =
            this.selection.getSelection();

        if (!selection) {

            return null;

        }

        let node = selection.focusNode;

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

    // salvar posição atual do cursor
    saveCaret(): CaretSnapshot | undefined {

        const paragraphId =
            this.selection.getCurrentParagraphId();

        if (paragraphId === null) {

            return;

        }

        return {

            paragraphId,

            offset:
                this.selection.getCaretOffset(),

        };

    }

    // restaurar posição do cursor
    restoreCaret(

        caret: CaretSnapshot | null

    ) {

        if (!caret) {

            return;

        }

        this.selection.setCaret(

            caret.paragraphId,

            caret.offset

        );

    }

    // ---------------------------------- //

    private handleKeyDown = (event: KeyboardEvent) => {

        switch (event.key) {

            case "ArrowUp":
                this.engine.breakHistoryGroup();
                this.onArrowUp(event);
                break;

            case "ArrowDown":
                this.engine.breakHistoryGroup();
                this.onArrowDown(event);
                break;

            case "ArrowLeft":
                this.engine.breakHistoryGroup();
                if (event.shiftKey) {
                    event.preventDefault();
                    this.extendLeft();
                } else {
                    event.preventDefault();
                    this.moveLeft();
                }
                break;

            case "ArrowRight":
                this.engine.breakHistoryGroup();
                if (event.shiftKey) {
                    event.preventDefault();
                    this.extendRight();
                } else {
                    event.preventDefault();
                    this.moveRight();
                }
                break;

            case "Home":
                this.engine.breakHistoryGroup();

                if (event.shiftKey) {
                    this.onShiftHome(event);
                } else {
                    this.onHome(event);
                }

                break;

            case "End":
                this.engine.breakHistoryGroup();

                if (event.shiftKey) {
                    this.onShiftEnd(event);
                } else {
                    this.onEnd(event);
                }

                break;

            case "PageUp":
                this.engine.breakHistoryGroup();

                if (event.shiftKey) {

                    this.onShiftPageUp(event);

                }

                break;

            case "PageDown":
                this.engine.breakHistoryGroup();

                if (event.shiftKey) {

                    this.onShiftPageDown(event);

                }

                break;

        }

    };

    // ================================================================
    // SETA PARA CIMA
    // ================================================================

    private onArrowUp(
        event: KeyboardEvent
    ) {

        event.preventDefault();

        this.selection.syncControllerFromDOM();

        const paragraphId =
            this.selection.getCurrentParagraphId();

        if (paragraphId === null) {
            return;
        }

        const offset =
            this.selection.getCaretOffset();

        const currentFragment =
            this.selection.getVisualFragmentForOffset(
                paragraphId,
                offset
            );

        if (!currentFragment) {
            return;
        }

        const line =
            this.selection.getCaretLinePosition(
                currentFragment
            );

        if (!line) {
            return;
        }

        console.log("[ARROW UP LINE]", {
            paragraphId,
            offset,
            lineIndex: line.lineIndex,
            lineCount: line.lineCount
        });

        const caretPosition =
            this.selection.getCaretVisualPosition();

        if (!caretPosition) {
            return;
        }

        const lineHeight =
            parseFloat(
                getComputedStyle(
                    currentFragment
                ).lineHeight
            ) || 20;


        // ============================================================
        // AINDA EXISTE UMA LINHA ACIMA NO MESMO FRAGMENTO
        // ============================================================

        if (line.lineIndex > 0) {

            const localOffset =
                this.selection.getClosestOffsetInFragment(
                    currentFragment,
                    caretPosition.x,
                    caretPosition.y - lineHeight
                );

            const fragmentStart =
                Number(
                    currentFragment.dataset.startOffset ?? 0
                );

            const fragmentEnd =
                Number(
                    currentFragment.dataset.endOffset ??
                    fragmentStart +
                    (
                        currentFragment.textContent?.length ??
                        0
                    )
                );

            const newOffset =
                Math.max(
                    fragmentStart,
                    Math.min(
                        fragmentStart + localOffset,
                        fragmentEnd
                    )
                );

            this.selection.setCaret(
                paragraphId,
                newOffset
            );

            return;
        }


        // ============================================================
        // PRIMEIRA LINHA DO FRAGMENTO
        // ============================================================

        const previousFragment =
            this.selection.getPreviousVisualFragment(
                paragraphId,
                offset
            );


        // ============================================================
        // EXISTE FRAGMENTO ANTERIOR DO MESMO BLOCO
        // ============================================================

        if (previousFragment) {

            const localOffset =
                this.selection.getClosestOffsetInFragment(
                    previousFragment,
                    caretPosition.x,
                    caretPosition.y - lineHeight
                );

            const fragmentStart =
                Number(
                    previousFragment.dataset.startOffset ?? 0
                );

            const fragmentEnd =
                Number(
                    previousFragment.dataset.endOffset ??
                    fragmentStart +
                    (
                        previousFragment.textContent?.length ??
                        0
                    )
                );

            const newOffset =
                Math.max(
                    fragmentStart,
                    Math.min(
                        fragmentStart + localOffset,
                        fragmentEnd
                    )
                );

            this.selection.setCaret(
                paragraphId,
                newOffset
            );

            return;
        }


        // ============================================================
        // NÃO EXISTE FRAGMENTO ANTERIOR
        // → VAMOS PARA O BLOCO ANTERIOR
        // ============================================================

        const previousParagraph =
            this.selection.getPreviousParagraphFrom(
                paragraphId
            );

        if (!previousParagraph) {
            return;
        }

        const previousParagraphId =
            Number(
                previousParagraph.dataset.paragraphId ??
                previousParagraph.dataset.id
            );

        if (!Number.isFinite(previousParagraphId)) {
            return;
        }

        const previousBlock =
            this.selection.getLastVisualFragment(
                previousParagraphId
            );

        if (!previousBlock) {
            return;
        }

        const previousBlockStart =
            Number(
                previousBlock.dataset.startOffset ?? 0
            );

        const previousBlockEnd =
            Number(
                previousBlock.dataset.endOffset ??
                previousBlockStart +
                (
                    previousBlock.textContent?.length ??
                    0
                )
            );

        const localOffset =
            this.selection.getClosestOffsetInFragment(
                previousBlock,
                caretPosition.x,
                caretPosition.y - lineHeight
            );

        const newOffset =
            Math.max(
                previousBlockStart,
                Math.min(
                    previousBlockStart + localOffset,
                    previousBlockEnd
                )
            );

        this.selection.setCaret(
            previousParagraphId,
            newOffset
        );

    }


    // ================================================================
    // SETA PARA BAIXO
    // ================================================================

    private onArrowDown(
        event: KeyboardEvent
    ) {

        event.preventDefault();

        this.selection.syncControllerFromDOM();

        const paragraphId =
            this.selection.getCurrentParagraphId();

        if (paragraphId === null) {
            return;
        }

        const offset =
            this.selection.getCaretOffset();

        const currentFragment =
            this.selection.getVisualFragmentForOffset(
                paragraphId,
                offset
            );

        if (!currentFragment) {
            return;
        }

        const line =
            this.selection.getCaretLinePosition(
                currentFragment
            );

        if (!line) {
            return;
        }

        console.log("[ARROW DOWN LINE]", {
            paragraphId,
            offset,
            lineIndex: line.lineIndex,
            lineCount: line.lineCount
        });

        const caretPosition =
            this.selection.getCaretVisualPosition();

        if (!caretPosition) {
            return;
        }

        const lineHeight =
            parseFloat(
                getComputedStyle(
                    currentFragment
                ).lineHeight
            ) || 20;


        // ============================================================
        // AINDA EXISTE UMA LINHA ABAIXO NO MESMO FRAGMENTO
        // ============================================================

        if (
            line.lineIndex <
            line.lineCount - 1
        ) {

            const localOffset =
                this.selection.getClosestOffsetInFragment(
                    currentFragment,
                    caretPosition.x,
                    caretPosition.y + lineHeight
                );

            const fragmentStart =
                Number(
                    currentFragment.dataset.startOffset ?? 0
                );

            const fragmentEnd =
                Number(
                    currentFragment.dataset.endOffset ??
                    fragmentStart +
                    (
                        currentFragment.textContent?.length ??
                        0
                    )
                );

            const newOffset =
                Math.max(
                    fragmentStart,
                    Math.min(
                        fragmentStart + localOffset,
                        fragmentEnd
                    )
                );

            this.selection.setCaret(
                paragraphId,
                newOffset
            );

            return;
        }


        // ============================================================
        // ÚLTIMA LINHA DO FRAGMENTO
        // ============================================================

        const nextFragment =
            this.selection.getNextVisualFragment(
                paragraphId,
                offset
            );


        // ============================================================
        // EXISTE FRAGMENTO SEGUINTE DO MESMO BLOCO
        // ============================================================

        if (nextFragment) {

            const localOffset =
                this.selection.getClosestOffsetInFragment(
                    nextFragment,
                    caretPosition.x,
                    caretPosition.y + lineHeight
                );

            const fragmentStart =
                Number(
                    nextFragment.dataset.startOffset ?? 0
                );

            const fragmentEnd =
                Number(
                    nextFragment.dataset.endOffset ??
                    fragmentStart +
                    (
                        nextFragment.textContent?.length ??
                        0
                    )
                );

            const newOffset =
                Math.max(
                    fragmentStart,
                    Math.min(
                        fragmentStart + localOffset,
                        fragmentEnd
                    )
                );

            this.selection.setCaret(
                paragraphId,
                newOffset
            );

            return;
        }


        // ============================================================
        // NÃO EXISTE FRAGMENTO SEGUINTE
        // → VAMOS PARA O PRÓXIMO BLOCO
        // ============================================================

        const nextParagraph =
            this.selection.getNextParagraphFrom(
                paragraphId
            );

        if (!nextParagraph) {
            return;
        }

        const nextParagraphId =
            Number(
                nextParagraph.dataset.paragraphId ??
                nextParagraph.dataset.id
            );

        if (!Number.isFinite(nextParagraphId)) {
            return;
        }

        const nextBlock =
            this.selection.getFirstVisualFragment(
                nextParagraphId
            );

        if (!nextBlock) {
            return;
        }

        const nextBlockStart =
            Number(
                nextBlock.dataset.startOffset ?? 0
            );

        const nextBlockEnd =
            Number(
                nextBlock.dataset.endOffset ??
                nextBlockStart +
                (
                    nextBlock.textContent?.length ??
                    0
                )
            );

        const localOffset =
            this.selection.getClosestOffsetInFragment(
                nextBlock,
                caretPosition.x,
                caretPosition.y + lineHeight
            );

        const newOffset =
            Math.max(
                nextBlockStart,
                Math.min(
                    nextBlockStart + localOffset,
                    nextBlockEnd
                )
            );

        this.selection.setCaret(
            nextParagraphId,
            newOffset
        );

    }
    // ------------------------------- //

    // Quando aperta "home" //
    private onHome(
        event: KeyboardEvent
    ) {

        event.preventDefault();

        this.selection.syncControllerFromDOM();

        const paragraphId =
            this.selection.getCurrentParagraphId();

        if (paragraphId === null) {
            return;
        }

        if (event.shiftKey) {

            this.selection.extendSelection(
                paragraphId,
                0
            );

        } else {

            this.selection.setCaret(
                paragraphId,
                0
            );

        }

    }

    // Quando aperta "shift + home" //
    private onShiftHome(
        event: KeyboardEvent
    ) {

        event.preventDefault();

        this.selection.syncControllerFromDOM();

        const focus =
            this.selection.getFocus();

        if (!focus) {
            return;
        }

        this.selection.setFocus(

            focus.paragraphId,

            0

        );

    }

    // Quando aperta "end" //
    private onEnd(
        event: KeyboardEvent
    ) {

        event.preventDefault();

        this.selection.syncControllerFromDOM();

        const paragraphId =
            this.selection.getCurrentParagraphId();

        if (paragraphId === null) {
            return;
        }

        const length =
            this.selection.getParagraphLogicalLength(
                paragraphId
            );

        if (event.shiftKey) {

            this.selection.extendSelection(
                paragraphId,
                length
            );

        } else {

            this.selection.setCaret(
                paragraphId,
                length
            );

        }

    }

    // Quando aperta "shift + end" //
    private onShiftEnd(
        event: KeyboardEvent
    ) {

        event.preventDefault();

        this.selection.syncControllerFromDOM();

        const focus = this.selection.getFocus();

        if (!focus) {
            return;
        }

        const paragraph =
            document.querySelector(

                `p[data-id="${focus.paragraphId}"]`

            ) as HTMLParagraphElement | null;

        if (!paragraph) {

            return;

        }

        const end =
            paragraph.textContent?.length ?? 0;

        this.selection.setFocus(

            focus.paragraphId,

            end

        );

    }

    // Quando aperta "Shift + PageUp" //
    private onShiftPageUp(
        event: KeyboardEvent
    ) {

        event.preventDefault();

        this.selection.syncControllerFromDOM();

        this.selection.selectToDocumentStart();

    }

    // Quando aperta "Shift + PageDown" //
    private onShiftPageDown(
        event: KeyboardEvent
    ) {

        event.preventDefault();

        this.selection.syncControllerFromDOM();

        this.selection.selectToDocumentEnd();

    }

    // Quando aperta "left" //
    public moveLeft() {

        this.selection.syncControllerFromDOM();

        const paragraphId =
            this.selection.getCurrentParagraphId();

        if (paragraphId === null) {
            return;
        }

        const offset =
            this.selection.getCaretOffset();

        // ---------------------------------------------
        // AINDA EXISTE CARACTERE À ESQUERDA
        // ---------------------------------------------

        if (offset > 0) {

            this.selection.setCaret(
                paragraphId,
                offset - 1
            );

            return;

        }

        // ---------------------------------------------
        // INÍCIO DO PARÁGRAFO
        // ---------------------------------------------

        const previous =
            this.selection.getPreviousParagraphFrom(
                paragraphId
            );

        if (!previous) {
            return;
        }

        const previousId =
            Number(previous.dataset.id);

        const previousLength =
            this.selection.getParagraphLogicalLength(
                previousId
            );

        this.selection.setCaret(
            previousId,
            previousLength
        );

    }
    // ----------------------------------------------------- //

    // Quando aperta "right" //
    public moveRight() {

        this.selection.syncControllerFromDOM();

        const paragraphId =
            this.selection.getCurrentParagraphId();

        if (paragraphId === null) {
            return;
        }

        const offset =
            this.selection.getCaretOffset();

        const length =
            this.selection.getParagraphLogicalLength(
                paragraphId
            );

        // ---------------------------------------------
        // AINDA EXISTE TEXTO À DIREITA
        // ---------------------------------------------

        if (offset < length) {

            this.selection.setCaret(
                paragraphId,
                offset + 1
            );

            return;

        }

        // ---------------------------------------------
        // FIM DO PARÁGRAFO
        // ---------------------------------------------

        const next =
            this.selection.getNextParagraphFrom(
                paragraphId
            );

        if (!next) {
            return;
        }

        this.selection.setCaret(
            Number(next.dataset.id),
            0
        );

    }
    // ----------------------------------------------------- //

    // Extend Left //
    private extendLeft() {

        this.selection.syncControllerFromDOM();

        const paragraphId =
            this.selection.getFocusParagraphId();

        if (paragraphId === null) {
            return;
        }

        const offset =
            this.selection.getFocusOffset();

        if (offset > 0) {

            this.selection.setFocus(
                paragraphId,
                offset - 1
            );

            return;

        }

        const previous =
            this.selection.getPreviousParagraphFrom(
                paragraphId
            );

        if (!previous) {
            return;
        }

        const previousId =
            Number(previous.dataset.id);

        const previousLength =
            this.selection.getParagraphLogicalLength(
                previousId
            );

        this.selection.setFocus(
            previousId,
            previousLength
        );

    }
    // ----------------------------------------------- //

    // Extend Right //
    private extendRight() {

        this.selection.syncControllerFromDOM();

        const paragraphId =
            this.selection.getFocusParagraphId();

        if (paragraphId === null) {
            return;
        }

        const offset =
            this.selection.getFocusOffset();

        const length =
            this.selection.getParagraphLogicalLength(
                paragraphId
            );

        // ---------------------------------------------
        // EXISTE TEXTO À DIREITA
        // ---------------------------------------------

        if (offset < length) {

            this.selection.setFocus(
                paragraphId,
                offset + 1
            );

            return;

        }

        // ---------------------------------------------
        // FIM DO PARÁGRAFO
        // ---------------------------------------------

        const next =
            this.selection.getNextParagraphFrom(
                paragraphId
            );

        if (!next) {
            return;
        }

        this.selection.setFocus(
            Number(next.dataset.id),
            0
        );

    }
    // --------------------------------- //

}