// EditController.ts
// src/editor/controller
import { EditorEngine } from "../engine/EditorEngine";
import { SelectionManager } from "../selection/SelectionManager";
import { ClipboardManager } from "../clipboard/ClipboardManager";

export class EditController {

    private root: HTMLDivElement;
    private engine: EditorEngine;
    private selection: SelectionManager;
    private clipboard: ClipboardManager;
    private onSave: () => void | Promise<void>;
    private onOpen: () => void | Promise<void>;

    constructor(

        root: HTMLDivElement,
        engine: EditorEngine,
        selection: SelectionManager,
        clipboard: ClipboardManager,
        onSave: () => void | Promise<void>,
        onOpen: () => void | Promise<void>

    ) {

        this.root = root;
        this.engine = engine;
        this.selection = selection;
        this.clipboard = clipboard;
        this.onSave = onSave;
        this.onOpen = onOpen;

    }

    attach() {

        this.root.addEventListener(

            "keydown",

            this.handleKeyDown

        );

        this.root.addEventListener(

            "paste",

            this.handlePaste

        );

    }

    detach() {

        this.root.removeEventListener(

            "keydown",

            this.handleKeyDown

        );

        this.root.removeEventListener(

            "paste",

            this.handlePaste

        );

    }

    // KEY DOWN
    private handleKeyDown = (

        event: KeyboardEvent

    ) => {

        if (event.ctrlKey || event.metaKey) {

            switch (event.key.toLowerCase()) {

                case "s": {
                    event.preventDefault();
                    void this.onSave();
                    return;
                }

                case "o": {
                    event.preventDefault();
                    void this.onOpen();
                    return;
                }

                case "z": {

                    event.preventDefault();
                    if (event.shiftKey) {
                        this.engine.redo();
                    } else {
                        this.engine.undo();
                    }
                    return;
                }

                case "y": {

                    event.preventDefault();

                    this.engine.redo();

                    return;

                }

                case "a": {

                    event.preventDefault();

                    this.selectAll();

                    return;

                }

                case "c": {

                    this.selection.syncControllerFromDOM();

                    if (!this.selection.hasSelection()) {
                        return;
                    }

                    event.preventDefault();

                    const text =
                        this.selection.getSelectedText();

                    void this.clipboard.copy(text);

                    return;
                }

                case "x": {

                    this.selection.syncControllerFromDOM();

                    if (!this.selection.hasSelection()) {
                        return;
                    }

                    event.preventDefault();

                    void this.clipboard.copy(
                        this.selection.getSelectedText()
                    );

                    this.executeReplaceSelection("");

                    return;
                }

                // Como o handlePaste() já faz todo o trabalho, o keydown não precisa conhecer Ctrl+V
                // o "case v" pode ser removido inteiro
                case "v": {

                    return;

                }

            }

        }

        // =========================================================
        // MOVER BLOCO
        // =========================================================

        if (
            event.altKey &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.shiftKey &&
            (
                event.key === "ArrowUp" ||
                event.key === "ArrowDown"
            )
        ) {

            const selection =
                window.getSelection();

            if (
                !selection ||
                !selection.focusNode
            ) {

                return;

            }

            const focusNode =
                selection.focusNode;

            const paragraph =
                focusNode.nodeType === Node.ELEMENT_NODE

                    ? (focusNode as Element).closest(
                        "p[data-id]"
                    )

                    : focusNode.parentElement?.closest(
                        "p[data-id]"
                    );

            if (!paragraph) {

                return;

            }

            const id =
                Number(paragraph.getAttribute("data-id"));

            if (!id) {

                return;

            }

            event.preventDefault();

            if (event.key === "ArrowUp") {

                this.engine.moveParagraphUp(id);

            } else {

                this.engine.moveParagraphDown(id);

            }

            return;

        }


        // =========================================================
        // BACKSPACE / DELETE
        // =========================================================

        switch (event.key) {

            case "Backspace":

                this.onBackspace(event);

                break;

            case "Delete":

                this.onDelete(event);

                break;

        }

    };
    // ------------------------------------ //

    // handleBeforeInput
    public handleBeforeInput = (
        event: InputEvent
    ) => {

        const paragraphId =
            this.selection.getCurrentParagraphId();

        if (paragraphId === null) {
            return;
        }

        const position =
            this.selection.getCaretOffset();

        switch (event.inputType) {

            case "insertText": {

                event.preventDefault();

                if (this.selection.hasSelection()) {

                    this.executeReplaceSelection(
                        event.data ?? ""
                    );

                } else {

                    this.engine.execute({

                        type: "INSERT_TEXT",

                        paragraphId,

                        position,

                        text: event.data ?? ""

                    });

                }

                return;
            }

            case "deleteContentBackward": {

                event.preventDefault();

                this.onBackspace(
                    event as unknown as KeyboardEvent
                );

                return;
            }

            case "deleteContentForward": {

                event.preventDefault();

                this.onDelete(
                    event as unknown as KeyboardEvent
                );

                return;
            }

            case "insertParagraph": {

                event.preventDefault();

                this.engine.execute({

                    type: "SPLIT_PARAGRAPH",

                    id: paragraphId,

                    offset: position

                });

                return;
            }

            case "insertFromPaste": {

                return;
            }

        }

    };
    // ----------------------- //

    // handle paste //
    private handlePaste = (

        event: ClipboardEvent

    ) => {

        event.preventDefault();

        const text =

            event.clipboardData?.getData(

                "text/plain"

            ) ?? "";

        if (!text) {

            return;

        }

        if (text.includes("\n")) {

            const paragraphId =

                this.selection.getCurrentParagraphId();

            if (paragraphId === null) {

                return;

            }

            this.engine.execute({

                type: "PASTE_MULTI_PARAGRAPH",

                paragraphId,

                position:

                    this.selection.getCaretOffset(),

                text,

            });

            return;

        }

        if (this.selection.hasSelection()) {

            this.executeReplaceSelection(text);

            return;

        }

        const paragraphId =

            this.selection.getCurrentParagraphId();

        if (paragraphId === null) {

            return;

        }

        this.engine.execute({

            type: "INSERT_TEXT",

            paragraphId,

            position:

                this.selection.getCaretOffset(),

            text,

        });

    };
    // ------------------------------------- //

    // SE APERTAR "BACKSPACE" //
    private onBackspace(
        event: KeyboardEvent
    ) {

        event.preventDefault();

        console.log(
            "[BACKSPACE STATE]",
            {
                hasSelection:
                    this.selection.hasSelection(),

                currentParagraphId:
                    this.selection.getCurrentParagraphId(),

                caretOffset:
                    this.selection.getCaretOffset(),

                selection:
                    this.selection.getCurrentSelection(),
            }
        );

        if (this.selection.hasSelection()) {

            this.executeReplaceSelection("");

            return;

        }

        const paragraphId =
            this.selection.getCurrentParagraphId();

        if (paragraphId === null) {
            return;
        }

        const position =
            this.selection.getCaretOffset();

        // ------------------- //
        if (position > 0) {

            const paragraph =
                document.querySelector(
                    `p[data-id="${paragraphId}"]`
                ) as HTMLParagraphElement | null;

            if (!paragraph) {
                return;
            }

            const text =
                paragraph.textContent ?? "";

            const deletedText =
                text.slice(
                    position - 1,
                    position
                );

            if (!deletedText) {
                return;
            }

            this.engine.execute({

                type: "DELETE_TEXT",

                paragraphId,

                position: position - 1,

                deletedText,

                direction: "backward",

            });

            return;
        }

        this.engine.execute({

            type: "MERGE_PREVIOUS",

            id: paragraphId,

        });

    }

    // SE APERTAR "DELETE" //
    private onDelete(
        event: KeyboardEvent
    ) {

        event.preventDefault();

        console.log(
            "[DELETE STATE]",
            {
                hasSelection:
                    this.selection.hasSelection(),

                currentParagraphId:
                    this.selection.getCurrentParagraphId(),

                caretOffset:
                    this.selection.getCaretOffset(),

                selection:
                    this.selection.getCurrentSelection(),
            }
        );

        // --------------------------------------------------
        // EXISTE SELEÇÃO
        // --------------------------------------------------

        if (this.selection.hasSelection()) {

            this.executeReplaceSelection("");

            return;

        }

        // --------------------------------------------------
        // CARET
        // --------------------------------------------------

        const paragraphId =
            this.selection.getCurrentParagraphId();

        if (paragraphId === null) {
            return;
        }

        const position =
            this.selection.getCaretOffset();

        const paragraph =
            document.querySelector(
                `p[data-id="${paragraphId}"]`
            ) as HTMLParagraphElement | null;

        if (!paragraph) {
            return;
        }

        const text =
            paragraph.textContent ?? "";

        // --------------------------------------------------
        // HÁ CARACTERE À DIREITA
        // --------------------------------------------------

        if (position < text.length) {

            const deletedText =
                text.slice(
                    position,
                    position + 1
                );

            if (!deletedText) {
                return;
            }

            this.engine.execute({

                type: "DELETE_TEXT",

                paragraphId,

                position,

                deletedText,

                direction: "forward",

            });

            return;

        }

        // --------------------------------------------------
        // CARET NO FINAL → MESCLAR COM PRÓXIMO
        // --------------------------------------------------

        this.engine.execute({

            type: "MERGE_NEXT",

            id: paragraphId,

        });

    }
    // -------------------------------- //

    // SELECIONAR TUDO (CTRL + A) //
    private selectAll() {

        console.log("[CTRL+A] EditController.selectAll CHAMADO");

        this.selection.selectAll();

    }
    // ------------------------------- //

    // executeReplaceSelection //
    private executeReplaceSelection(text: string) {

        if (this.selection.isMultiParagraphSelection()) {

            const multiSelection =

                this.selection.getMultiParagraphSelection();

            if (!multiSelection) {

                return;

            }

            this.engine.execute({

                type: "REPLACE_SELECTION_MULTI",

                selection:

                    this.selection.getOrderedSelection()!,

                selectionSnapshot:

                    this.selection.save()!,

                multiSelection,

                text,

            });

        } else {

            this.engine.execute({

                type: "REPLACE_SELECTION",

                selection:

                    this.selection.getOrderedSelection()!,

                selectionSnapshot:

                    this.selection.save()!,

                text,

            });

        }

    }

}