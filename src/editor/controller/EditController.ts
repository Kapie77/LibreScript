// EditController.ts
// src/editor/controller
import { EditorEngine } from "../engine/EditorEngine";
import { SelectionManager } from "../selection/SelectionManager";

export class EditController {

    private root: HTMLDivElement;
    private engine: EditorEngine;
    private selection = new SelectionManager();

    constructor(

        root: HTMLDivElement,
        engine: EditorEngine

    ) {

        this.root = root;
        this.engine = engine;

    }

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

    // KEY DOWN
    private handleKeyDown = (

        event: KeyboardEvent

    ) => {

        if (event.ctrlKey || event.metaKey) {

            switch (event.key.toLowerCase()) {

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

                    if (!this.selection.hasSelection()) {

                        return;

                    }

                    event.preventDefault();

                    navigator.clipboard.writeText(

                        this.selection.getSelectedText()

                    );

                    return;

                }

                case "x": {

                    if (!this.selection.hasSelection()) {

                        return;

                    }

                    event.preventDefault();

                    navigator.clipboard.writeText(

                        this.selection.getSelectedText()

                    );

                    this.engine.execute({

                        type: "REPLACE_SELECTION",

                        selection: this.selection.getOrderedSelection()!,

                        selectionSnapshot: this.selection.save()!,

                        text: ""

                    });

                    return;

                }

                case "v": {

                    event.preventDefault();

                    navigator.clipboard.readText().then(text => {

                        if (!text) {

                            return;

                        }

                        if (this.selection.hasSelection()) {

                            this.engine.execute({

                                type: "REPLACE_SELECTION",

                                selection: this.selection.getOrderedSelection()!,

                                selectionSnapshot: this.selection.save()!,

                                text

                            });

                        }

                        // depois implementaremos colar sem seleção

                    });

                    return;

                }

            }

        }

        switch (event.key) {

            case "Enter":

                this.onEnter(event);

                break;

            case "Backspace":

                this.onBackspace(event);

                break;

            case "Delete":

                this.onDelete(event);

                break;

        }

    };
    // ------------------------------------ //

    // SE APERTAR "ENTER" //
    private onEnter(

        event: KeyboardEvent

    ) {

        event.preventDefault();

        const paragraphId =

            this.selection.getCurrentParagraphId();

        if (paragraphId === null) {

            return;

        }

        const offset =

            this.selection.getCaretOffset();

        this.engine.execute({

            type: "SPLIT_PARAGRAPH",

            id: paragraphId,

            offset,

        });

    }
    // ---------------------------- //

    // SE APERTAR "BACKSPACE" //
    private onBackspace(

        event: KeyboardEvent

    ) {

        if (this.selection.hasSelection()) {

            if (this.selection.isMultiParagraphSelection()) {

                console.log(
                    this.selection.getMultiParagraphSelection()
                );

            }

            event.preventDefault();

            if (this.selection.isMultiParagraphSelection()) {

                this.engine.execute({

                    type: "REPLACE_SELECTION_MULTI",

                    selection:
                        this.selection.getOrderedSelection()!,

                    selectionSnapshot:
                        this.selection.save()!,

                    multiSelection:
                        this.selection.getMultiParagraphSelection()!,

                    text: ""

                });

            } else {

                this.engine.execute({

                    type: "REPLACE_SELECTION",

                    selection:
                        this.selection.getOrderedSelection()!,

                    selectionSnapshot:
                        this.selection.save()!,

                    text: ""

                });

            }

            return;

        }

        if (

            !this.selection.isCaretAtStart()

        ) {

            return;

        }

        event.preventDefault();

        const paragraphId =

            this.selection.getCurrentParagraphId();

        if (

            paragraphId === null

        ) {

            return;

        }

        this.engine.execute({

            type: "MERGE_PREVIOUS",

            id: paragraphId,

        });

    }
    // ----------------------------- //

    // O APERTA "DELETE"
    private onDelete(

        event: KeyboardEvent

    ) {

        // ------------------------------------------------- //
        if (this.selection.hasSelection()) {

            event.preventDefault();

            // ----------------------------------------------- //
            if (this.selection.isMultiParagraphSelection()) {

                this.engine.execute({

                    type: "REPLACE_SELECTION_MULTI",

                    selection: this.selection.getOrderedSelection()!,

                    selectionSnapshot: this.selection.save()!,

                    multiSelection:
                        this.selection.getMultiParagraphSelection()!,

                    text: ""

                });

            } else {

                if (this.selection.isMultiParagraphSelection()) {

                    this.engine.execute({

                        type: "REPLACE_SELECTION_MULTI",

                        selection:
                            this.selection.getOrderedSelection()!,

                        selectionSnapshot:
                            this.selection.save()!,

                        multiSelection:
                            this.selection.getMultiParagraphSelection()!,

                        text: ""

                    });

                } else {

                    this.engine.execute({

                        type: "REPLACE_SELECTION",

                        selection:
                            this.selection.getOrderedSelection()!,

                        selectionSnapshot:
                            this.selection.save()!,

                        text: ""

                    });

                }

            }
            // --------------------------------------------- //

            return;

        }
        // ------------------------------------------------- //

        if (

            !this.selection.isCaretAtEnd()

        ) {

            return;

        }

        event.preventDefault();

        const paragraphId =

            this.selection.getCurrentParagraphId();

        if (

            paragraphId === null

        ) {

            return;

        }

        const result =

            this.engine.mergeWithNext(

                paragraphId

            );

        if (!result) {

            return;

        }

        this.selection.setCaret(

            result.paragraphId,

            result.offset

        );

    }
    // -------------------------------- //

    // SELECIONAR TUDO (CTRL + A) //
    private selectAll() {

        const first = this.root.querySelector("p");

        const paragraphs =

            this.root.querySelectorAll("p");

        const last =

            paragraphs[paragraphs.length - 1];

        if (

            !first ||
            !last

        ) {

            return;

        }

        const selection =

            window.getSelection();

        if (!selection) {

            return;

        }

        const range =

            document.createRange();

        range.setStart(

            first.firstChild ?? first,

            0

        );

        range.setEnd(

            last.firstChild ?? last,

            last.textContent?.length ?? 0

        );

        selection.removeAllRanges();

        selection.addRange(range);

    }
    // ------------------------------- //

}