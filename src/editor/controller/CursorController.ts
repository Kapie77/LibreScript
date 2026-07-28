// CursorController.ts
// src/editor/controller/
import { EditorEngine } from "../engine/EditorEngine";
import { SelectionManager } from "../selection/SelectionManager";
import type { CaretSnapshot } from "../history/UndoData";
// -------------------------------------------------- //

export class CursorController {

    private root: HTMLDivElement;
    private engine: EditorEngine;
    private selection = new SelectionManager();

    // CONSTRUCTOR //
    constructor(

        root: HTMLDivElement,
        engine: EditorEngine

    ) {

        this.root = root;
        this.engine = engine;

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
                this.onHome(event);
                break;

            case "End":
                this.engine.breakHistoryGroup();
                this.onEnd(event);
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

        const paragraphId =

            this.selection.getCurrentParagraphId();

        if (

            paragraphId === null

        ) {

            return;

        }

        this.selection.setCaret(

            paragraphId,

            0

        );

    }

    // Quando aperta "end" //
    private onEnd(

        event: KeyboardEvent

    ) {

        event.preventDefault();

        const paragraphId =

            this.selection.getCurrentParagraphId();

        if (

            paragraphId === null

        ) {

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

        this.selection.setCaret(

            paragraphId,

            length

        );

    }

    // Quando aperta "left" //
    public moveLeft() {

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