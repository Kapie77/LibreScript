// DocumentView.ts
// src/editor/view/

import type { ScriptBlock } from "../../types/script";
import { CursorController } from "../controller/CursorController";
import { EditController } from "../controller/EditController";
import type { EditorEngine } from "../engine/EditorEngine";
import type { EditorInput } from "../../types/EditorInput";
import { SelectionManager } from "../selection/SelectionManager";

import type { CaretSnapshot } from "../history/UndoData";
import type { SelectionSnapshot } from "../history/UndoData";
// --------------------------------------------------------- //
export class DocumentView {

    // PRIVATE ATRIBUTO
    private blocks: ScriptBlock[] = [];
    private elements =
        new Map<number, HTMLParagraphElement>();
    private root: HTMLDivElement;
    private engine: EditorEngine;

    private rendering = false;
    private cursor: CursorController;
    private selection = new SelectionManager();
    private editor: EditController;

    // handleBeforeInput //
    private handleBeforeInput = (
        event: InputEvent
    ) => {

        if (

            event.inputType !== "insertText"

        ) {

            return;

        }

        const selection = window.getSelection();

        if (

            !selection ||

            selection.isCollapsed

        ) {

            return;

        }

        event.preventDefault();

        queueMicrotask(() => {

            // --------------------------------- //
            const ordered =
                this.selection.getOrderedSelection()!;

            const snapshot =
                this.selection.save()!;

            if (
                ordered.start.paragraphId ===
                ordered.end.paragraphId
            ) {

                this.engine.execute({

                    type: "REPLACE_SELECTION",

                    selection: ordered,
                    selectionSnapshot: snapshot,

                    text: event.data ?? ""

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

                        text:
                            event.data ?? ""

                    });

                } else {

                    this.engine.execute({

                        type: "REPLACE_SELECTION",

                        selection:
                            this.selection.getOrderedSelection()!,

                        selectionSnapshot:
                            this.selection.save()!,

                        text:
                            event.data ?? ""

                    });

                }

            }
            // ------------------------------- //

        });

    };
    // ------------------------------------------ //

    // handle input
    // descobre qual paragrafo foi alterado
    private handleInput = (

        event: Event

    ) => {

        if (this.engine.isRestoringHistory()) {

            return;

        }

        if (this.rendering) {

            return;

        }

        const element =

            this.cursor.getCurrentParagraphElement();

        if (!element) {

            return;

        }

        if (

            !element.dataset.id

        ) {

            return;

        }

        const id =

            Number(

                element.dataset.id

            );

        const content =

            element.textContent ?? "";

        const input: EditorInput = {

            paragraphId: id,

            content,

            inputType: (event as InputEvent).inputType,

            data: (event as InputEvent).data,

            caretOffset: this.selection.getCaretOffset(),

        };

        this.engine.handleInput(

            input

        );

    }

    // CONSTRUCTOR
    constructor(root: HTMLDivElement, engine: EditorEngine) {

        this.root = root;


        this.root.contentEditable = "true";
        this.root.spellcheck = false;
        this.engine = engine;
        
        // input //
        this.root.addEventListener(

            "input",

            this.handleRootInput

        );
        // --------

        // before input //
        this.root.addEventListener(
            "beforeinput",
            this.handleBeforeInput
        );
        //  -------

        this.cursor = new CursorController(

            this.root,

            engine

        );

        this.editor = new EditController(

            this.root,

            engine

        );

        this.cursor.attach();

        this.editor.attach();

    }

    getElement() {

        return this.root;

    }

    // create paragraph
    private createParagraph(

        block: ScriptBlock

    ): HTMLParagraphElement {

        const p =
            document.createElement("p");

        p.dataset.id =
            String(block.id);

        p.className =
            block.type;

        p.textContent =
            block.content;

        p.contentEditable = "true";
        
        return p;

    }

    // update paragraph
    private updateParagraph(

        element: HTMLParagraphElement,

        block: ScriptBlock

    ) {

        if (

            element.className !== block.type

        ) {

            element.className =
                block.type;

        }

        if (

            document.activeElement !== element &&

            element.textContent !== block.content

        ) {

            element.textContent =
                block.content;

        }

    }

    // handle root input
    private handleRootInput = (
        event: Event
    ) => {

        this.handleInput(event);

    };

    // render
    // desenha o documento
    render(blocks: ScriptBlock[]) {

        this.rendering = true;

        this.blocks = blocks;

        const validIds =
            new Set<number>();

        // Atualiza ou cria
        for (const block of blocks) {

            validIds.add(block.id);

            let element =
                this.elements.get(block.id);

            if (!element) {

                element =
                    this.createParagraph(block);

                this.elements.set(

                    block.id,

                    element

                );

            } else {

                this.updateParagraph(

                    element,

                    block

                );

            }

        }

        // Remove os apagados
        for (

            const [id, element]

            of this.elements

        ) {

            if (!validIds.has(id)) {

                element.remove();

                this.elements.delete(id);

            }

        }

        // Mantém a ordem correta
        blocks.forEach((block, index) => {

            const element =
                this.elements.get(block.id)!;

            const current =
                this.root.children[index];

            if (current !== element) {

                this.root.insertBefore(

                    element,

                    current ?? null

                );

            }

        });

        this.rendering = false;

    }

    // get blocks
    getBlocks() {

        return this.blocks;

    }

    getParagraphs() {

        return Array.from(

            this.root.querySelectorAll("p")

        );

    }

    getParagraphById(

        id: number

    ) {

        return this.root.querySelector(

            `p[data-id="${id}"]`

        ) as HTMLParagraphElement | null;

    }

    // destroy
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

        this.elements.clear();

        this.root.replaceChildren();

    }

    // save caret
    saveCaret(): CaretSnapshot | undefined {
        return this.cursor.saveCaret();
    }

    // save selection
    saveSelection(): SelectionSnapshot | undefined {
        return this.selection.save();
    }

    // restore caret
    restoreCaret(caret: CaretSnapshot | null) {

        this.cursor.restoreCaret(caret);

    }

    // restore selection
    restoreSelection(selection: SelectionSnapshot | null) {

        this.selection.restore(selection);
    }

}