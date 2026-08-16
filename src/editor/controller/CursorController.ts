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

    // Quando aperta "seta para cima" //
    private onArrowUp(

        event: KeyboardEvent

    ) {

        const previous =

            this.selection.getPreviousParagraph();

        if (!previous) {

            return;

        }

        event.preventDefault();

        const column =

            this.selection.getCaretColumn();

        this.selection.setCaret(

            Number(previous.dataset.id),

            column

        );

    }
    // ------------------------------- //

    // Quando aperta "seta pra baixo" //
    private onArrowDown(

        event: KeyboardEvent

    ) {

        const next =

            this.selection.getNextParagraph();

        if (!next) {

            return;

        }

        event.preventDefault();

        const column =

            this.selection.getCaretColumn();

        this.selection.setCaret(

            Number(next.dataset.id),

            column

        );

    }
    // ---------------------------- //

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

        const paragraph =
            document.querySelector(
                `p[data-id="${paragraphId}"]`
            ) as HTMLParagraphElement | null;

        if (!paragraph) {
            return;
        }

        const length =
            paragraph.textContent?.length ?? 0;

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

        // ainda existe caractere à esquerda
        if (offset > 0) {

            this.selection.setCaret(
                paragraphId,
                offset - 1
            );

            return;

        }

        // início do parágrafo → vai para o anterior
        const previous =
            this.selection.getPreviousParagraph();

        if (!previous) {
            return;
        }

        const previousId =
            Number(previous.dataset.id);

        const previousLength =
            previous.textContent?.length ?? 0;

        this.selection.setCaret(
            previousId,
            previousLength
        );

    }

    // Quando aperta "right" //
    public moveRight() {

        this.selection.syncControllerFromDOM();

        const paragraphId =
            this.selection.getCurrentParagraphId();

        if (paragraphId === null) {
            return;
        }

        const paragraph =
            document.querySelector(
                `p[data-id="${paragraphId}"]`
            ) as HTMLParagraphElement | null;

        if (!paragraph) {
            return;
        }

        const length =
            paragraph.textContent?.length ?? 0;

        const offset =
            this.selection.getCaretOffset();

        // ainda existe caractere à direita
        if (offset < length) {

            this.selection.setCaret(
                paragraphId,
                offset + 1
            );

            return;

        }

        // fim do parágrafo → vai para o próximo
        const next =
            this.selection.getNextParagraph();

        if (!next) {
            return;
        }

        this.selection.setCaret(
            Number(next.dataset.id),
            0
        );

    }

    // Extend Left //
    private extendLeft() {

        this.selection.syncControllerFromDOM();

        const paragraphId = this.selection.getFocusParagraphId()

        if (paragraphId === null) {
            return;
        }

        const offset = this.selection.getFocusOffset();

        if (offset > 0) {

            this.selection.setFocus(

                paragraphId,

                offset - 1

            );

            return;

        }

        const previous =
            this.selection.getPreviousParagraph();

        if (!previous) {
            return;
        }

        const previousLength =
            previous.textContent?.length ?? 0;

        this.selection.setFocus(

            Number(previous.dataset.id),

            previousLength

        );

    }

    // Extend Right //
    private extendRight() {

        this.selection.syncControllerFromDOM();

        const paragraphId = this.selection.getFocusParagraphId();

        if (paragraphId === null) {
            return;
        }

        const paragraph =
            document.querySelector(

                `p[data-id="${paragraphId}"]`

            ) as HTMLParagraphElement | null;

        if (!paragraph) {
            return;
        }

        const offset = this.selection.getFocusOffset();

        const length =
            paragraph.textContent?.length ?? 0;

        if (offset < length) {

            this.selection.setFocus(

                paragraphId,

                offset + 1

            );

            return;

        }

        const next =
            this.selection.getNextParagraph();

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