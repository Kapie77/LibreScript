// Geometry.ts
// src/layout/engine/

/*
===========================================================
Responsável exclusivamente pelos cálculos de altura.

Não conhece ScriptBlock.
Não conhece DOM.
Não conhece renderização.

O Editor e o PDF possuem seus próprios layouts e,
consequentemente, seus próprios cálculos de altura.

===========================================================
*/

import type { EditorBlockLayout } from "../BlockLayout";
import type { PdfBlockLayout } from "../pdf/PdfLayout";

// -------------------------------------------------------- //

export function getEditorContentHeight(
    lineCount: number,
    layout: EditorBlockLayout
) {

    return (
        lineCount *
        layout.lineHeight
    );

}

// -------------------------------------------------------- //

export function getEditorBlockHeight(
    lineCount: number,
    layout: EditorBlockLayout
) {

    return (
        lineCount *
        layout.lineHeight +
        layout.marginBottom
    );

}

// -------------------------------------------------------- //

export function getPdfBlockHeight(
    lineCount: number,
    layout: PdfBlockLayout
) {

    return (
        lineCount *
        layout.lineHeight +
        layout.marginBottom
    );

}