// SelectionController.ts
// src/editor/selection/
import type { SelectionState } from "./SelectionState";
import type { CaretPosition } from "./SelectionRange";

export class SelectionController {

    private state: SelectionState | null = null;

    getState(): SelectionState | null {

        return this.state;

    }

    setCaret(

        paragraphId: number,
        offset: number

    ) {

        this.state = {

            anchor: {

                paragraphId,
                offset

            },

            focus: {

                paragraphId,
                offset

            }

        };

    }

    setSelection(

        anchor: CaretPosition,

        focus: CaretPosition

    ) {

        this.state = {

            anchor: { ...anchor },

            focus: { ...focus }

        };

    }

    getAnchor(): CaretPosition | null {

        return this.state
            ? { ...this.state.anchor }
            : null;

    }

    getFocus(): CaretPosition | null {

        return this.state
            ? { ...this.state.focus }
            : null;

    }

}