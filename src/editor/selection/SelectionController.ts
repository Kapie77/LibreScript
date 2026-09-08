// SelectionController.ts
// src/editor/selection/
import type { SelectionState } from "./SelectionState";
import type { CaretPosition } from "./SelectionRange";

export class SelectionController {

    private state: SelectionState | null = null;

    // getState //
    getState(): SelectionState | null {

        return this.state;

    }

    // setCaret //
    setCaret(paragraphId: number, offset: number) {
        console.log("CONTROLLER SET CARET", {
            paragraphId,
            offset,
        });

        this.state = {
            anchor: { paragraphId, offset },
            focus: { paragraphId, offset }
        };
    }

    // setSelection //
    setSelection(anchor: CaretPosition, focus: CaretPosition) {
        console.log("CONTROLLER SET SELECTION", {
            anchorParagraphId: anchor.paragraphId,
            anchorOffset: anchor.offset,
            focusParagraphId: focus.paragraphId,
            focusOffset: focus.offset,
        });

        console.trace("SET SELECTION TRACE");

        this.state = {
            anchor: { ...anchor },
            focus: { ...focus }
        };
    }

    // getAnchor //
    getAnchor(): CaretPosition | null {

        return this.state
            ? { ...this.state.anchor }
            : null;

    }

    // getFocus //
    getFocus(): CaretPosition | null {

        return this.state
            ? { ...this.state.focus }
            : null;

    }

}