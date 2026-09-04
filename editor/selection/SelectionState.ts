// SelectionState.ts
// src/editor/selection/

import type {

    CaretPosition

} from "./SelectionRange";

export interface SelectionState {

    anchor: CaretPosition;

    focus: CaretPosition;

}