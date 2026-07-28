// SelectionManager.ts
// src/editor/selection/
import type { SelectionSnapshot } from "./SelectionSnapshot";
import type {

    SelectionRange,
    OrderedSelectionRange,
    /*CaretPosition*/

} from "./SelectionRange";

import type {
    MultiParagraphSelection
} from "../history/UndoData";

// ------------------------------------------------------------------------- //

export class SelectionManager {

    // current selection
    private currentSelection: SelectionRange | null = null;

    // Get Paragraph Element //
    private getParagraphElement(

        id: number

    ): HTMLParagraphElement | null {

        return document.querySelector(

            `p[data-id="${id}"]`

        ) as HTMLParagraphElement | null;

    }

    // Find Paragraph //
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

    // get or create text node
    private /*getOrCreateTextNode*/(

        paragraph: HTMLParagraphElement

    ): Text {

        for (const child of paragraph.childNodes) {

            if (child.nodeType === Node.TEXT_NODE) {

                return child as Text;

            }

        }

        const textNode = document.createTextNode("");

        paragraph.appendChild(textNode);

        return textNode;

    }

    // update current selection
    private updateCurrentSelection() {

        const selection = this.getSelection();

        if (

            !selection ||

            selection.rangeCount === 0

        ) {

            this.currentSelection = null;

            return;

        }

        const anchorId = this.findParagraph(

            selection.anchorNode

        )?.dataset.id;

        const focusId = this.findParagraph(

            selection.focusNode

        )?.dataset.id;

        if (

            !anchorId ||

            !focusId

        ) {

            this.currentSelection = null;

            return;

        }

        this.currentSelection = {

            anchor: {

                paragraphId: Number(anchorId),

                offset: selection.anchorOffset,

            },

            focus: {

                paragraphId: Number(focusId),

                offset: selection.focusOffset,

            },

        };

    }

    // get selection
    getSelection() {

        return window.getSelection();

    }

    // get range
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

    // função para mover o cursor para o início do de um parágrafo novo
    moveCaretToParagraphStart(

        paragraph: HTMLParagraphElement | null

    ) {

        if (!paragraph) {

            return;

        }

        const selection =
            this.getSelection();

        if (!selection) {

            return;

        }

        const range =
            document.createRange();

        let node = paragraph.firstChild;

        if (!node) {

            node = document.createTextNode("");

            paragraph.appendChild(node);

        }

        range.setStart(node, 0);

        range.collapse(true);

        selection.removeAllRanges();

        selection.addRange(range);

    }

    // retorna a barrinha (caret) pra posição certa após usar backspace
    setCaret(

        paragraphId: number,

        offset: number

    ) {

        const paragraph =

        this.getParagraphElement(

            paragraphId

        );

        if (!paragraph) {

            return;

        }

        const selection = this.getSelection();

        if (!selection) {

            return;

        }

        const range = document.createRange();

        let textNode: Text | null = null;

        for (const child of paragraph.childNodes) {

            if (child.nodeType === Node.TEXT_NODE) {

                textNode = child as Text;

                break;

            }

        }

        if (!textNode) {

            textNode = document.createTextNode("");

            paragraph.appendChild(textNode);

        }

        range.setStart(

            textNode,

            Math.min(

                offset,

                textNode.length

            )

        );

        range.collapse(true);

        selection.removeAllRanges();

        selection.addRange(range);

    }

    // move apenas o foco da seleção
    setFocus(

        paragraphId: number,

        offset: number

    ) {

        this.updateCurrentSelection();

        if (!this.currentSelection) {
            return;
        }

        const selection = this.getSelection();

        if (!selection) {
            return;
        }

        const anchorParagraph =
            this.getParagraphElement(
                this.currentSelection.anchor.paragraphId
            );

        const focusParagraph =
            this.getParagraphElement(
                paragraphId
            );

        if (!anchorParagraph || !focusParagraph) {
            return;
        }

        let anchorNode = anchorParagraph.firstChild;
        let focusNode = focusParagraph.firstChild;

        if (!anchorNode) {

            anchorNode = document.createTextNode("");

            anchorParagraph.appendChild(anchorNode);

        }

        if (!focusNode) {

            focusNode = document.createTextNode("");

            focusParagraph.appendChild(focusNode);

        }

        selection.removeAllRanges();

        selection.setBaseAndExtent(

            anchorNode,

            Math.min(
                this.currentSelection.anchor.offset,
                anchorNode.textContent?.length ?? 0
            ),

            focusNode,

            Math.min(
                offset,
                focusNode.textContent?.length ?? 0
            )

        );

    }

    // save //
    save(): SelectionSnapshot | undefined {

        const selection = this.getSelection();

        if (!selection) {
            return;
        }

        if (selection.isCollapsed) {
            return;
        }

        const anchorParagraph =
            this.findParagraph(selection.anchorNode);

        const focusParagraph =
            this.findParagraph(selection.focusNode);

        if (!anchorParagraph || !focusParagraph) {
            return;
        }

        return {

            anchorParagraphId: Number(anchorParagraph.dataset.id),
            anchorOffset: selection.anchorOffset,

            focusParagraphId: Number(focusParagraph.dataset.id),
            focusOffset: selection.focusOffset,

        };

    }

    // restore
    restore(snapshot: SelectionSnapshot | null) {

         if (!snapshot) {

            return;

        }

        const selection =
            this.getSelection();

        if (!selection) {

            return;

        }

        const anchorParagraph =
            document.querySelector(

                `p[data-id="${snapshot.anchorParagraphId}"]`

            ) as HTMLParagraphElement | null;

        const focusParagraph =
            document.querySelector(

                `p[data-id="${snapshot.focusParagraphId}"]`

            ) as HTMLParagraphElement | null;

        if (

            !anchorParagraph ||

            !focusParagraph

        ) {

            return;

        }

        let anchorNode = anchorParagraph.firstChild;
        let focusNode = focusParagraph.firstChild;

        if (!anchorNode) {

            anchorNode = document.createTextNode("");
            anchorParagraph.appendChild(anchorNode);

        }

        if (!focusNode) {

            focusNode = document.createTextNode("");
            focusParagraph.appendChild(focusNode);

        }

        if (

            !anchorNode ||

            !focusNode

        ) {

            return;

        }

        selection.removeAllRanges();
        selection.setBaseAndExtent(
            anchorNode,
            Math.min(
                snapshot.anchorOffset,
                anchorNode.textContent?.length ?? 0
            ),
            focusNode,
            Math.min(
                snapshot.focusOffset,
                focusNode.textContent?.length ?? 0
            )

        );

    }

    // get caret offset
    getCaretOffset(): number {

        this.updateCurrentSelection();

        if (!this.currentSelection) {

            return 0;

        }

        return this.currentSelection.focus.offset;

    }

    // get focus paragraph id
    getFocusParagraphId(): number | null {

        this.updateCurrentSelection();

        if (!this.currentSelection) {
            return null;
        }

        return this.currentSelection.focus.paragraphId;

    }

    // get focus offset
    getFocusOffset(): number {

        this.updateCurrentSelection();

        if (!this.currentSelection) {
            return 0;
        }

        return this.currentSelection.focus.offset;

    }

    // get current selection
    getCurrentSelection(): SelectionRange | null {

        this.updateCurrentSelection();

        return this.currentSelection;

    }

    // get current paragraph
    getCurrentParagraphId(): number | null {

        this.updateCurrentSelection();

        if (!this.currentSelection) {

            return null;

        }

        return this.currentSelection.focus.paragraphId;

    }

    

    // detecta quando o cursor está no início do parágrafo
    isCaretAtStart(): boolean {

        this.updateCurrentSelection();

        if (!this.currentSelection) {

            return false;

        }

        return this.currentSelection.focus.offset === 0;

    }

    // detecta quando o cursor está no final do parágrafo
    isCaretAtEnd(): boolean {

        this.updateCurrentSelection();

        if (!this.currentSelection) {

            return false;

        }

        const paragraph = this.getParagraphElement(

            this.currentSelection.focus.paragraphId

        );

        if (!paragraph) {

            return false;

        }

        const length = paragraph.textContent?.length ?? 0;

        return this.currentSelection.focus.offset === length;

    }

    

    // hasSelection
    hasSelection(): boolean {

        this.updateCurrentSelection();

        if (!this.currentSelection) {

            return false;

        }

        const {

            anchor,

            focus

        } = this.currentSelection;

        return (

            anchor.paragraphId !== focus.paragraphId ||

            anchor.offset !== focus.offset

        );

    }

    // isSelectionCollapsed
    isSelectionCollapsed(): boolean {

        return !this.hasSelection();

    }

    // get next paragraph
    getNextParagraph(): HTMLParagraphElement | null {

        const id = this.getCurrentParagraphId();

        if (id === null) {

            return null;

        }

        const current =

        this.getParagraphElement(

            id

        );

        if (!current) {

            return null;

        }

        return current.nextElementSibling as HTMLParagraphElement | null;

    }

    getPreviousParagraph(): HTMLParagraphElement | null {

        const id = this.getCurrentParagraphId();

        if (id === null) {

            return null;

        }

        const current =

        this.getParagraphElement(

            id

        );

        if (!current) {

            return null;

        }

        return current.previousElementSibling as HTMLParagraphElement | null;

    }

    getCaretColumn(): number {

        return this.getCaretOffset();

    }

    // getOrderedSelection
    getOrderedSelection(): OrderedSelectionRange | null {

        this.updateCurrentSelection();

        if (!this.currentSelection) {

            return null;

        }

        const {

            anchor,

            focus

        } = this.currentSelection;

        // parágrafos diferentes
        if (anchor.paragraphId !== focus.paragraphId) {

            if (anchor.paragraphId < focus.paragraphId) {

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

        // mesmo parágrafo
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

    // isMultiParagraphSelection
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

    // getMultiParagraphSelection
    getMultiParagraphSelection(): MultiParagraphSelection | null {

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
            document.querySelectorAll<HTMLParagraphElement>(
                "p[data-id]"
            );

        const selectedParagraphs = [];

        let started = false;

        for (const paragraph of paragraphs) {

            const id =
                Number(paragraph.dataset.id);

            if (id === selection.start.paragraphId) {

                started = true;

            }

            if (started) {

                selectedParagraphs.push({

                    id,

                    content:
                        paragraph.textContent ?? ""

                });

            }

            if (id === selection.end.paragraphId) {

                break;

            }

        }

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

    // isSingleParagraphSelection
    isSingleParagraphSelection(): boolean {

        return !this.isMultiParagraphSelection();

    }

    // getSelectedText
    getSelectedText(): string {

        const selection =

            this.getOrderedSelection();

        if (!selection) {

            return "";

        }

        if (

            selection.start.paragraphId !==

            selection.end.paragraphId

        ) {

            return "";

        }

        const paragraph = document.querySelector(

            `p[data-id="${selection.start.paragraphId}"]`

        ) as HTMLParagraphElement | null;

        if (!paragraph) {

            return "";

        }

        const text =

            paragraph.textContent ?? "";

        return text.slice(

            selection.start.offset,

            selection.end.offset

        );

    }

}