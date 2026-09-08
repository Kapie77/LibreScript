// SelectionRange.ts
// src/editor/selection/
export interface CaretPosition {

    paragraphId: number;
    offset: number;

}

export interface SelectionRange {

    anchor: CaretPosition;
    focus: CaretPosition;

}

export interface OrderedSelectionRange {

    start: CaretPosition;
    end: CaretPosition;

}