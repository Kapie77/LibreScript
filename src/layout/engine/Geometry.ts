// O único responsável por alturas

import type { BlockLayout } from "../layouts/ScriptBlockLayout";
import { LAYOUT_SCALE } from "../layouts/LayoutScale";
// -------------------------------------------------------- //

export function getPdfBlockHeight(
    lineCount: number,
    layout: BlockLayout
) {

    return (
        lineCount * layout.pdf.lineHeight +
        layout.pdf.marginBottom
    );

}

export function getEditorBlockHeight(
    lineCount: number,
    layout: BlockLayout
) {

    return (
        getPdfBlockHeight(
            lineCount,
            layout
        ) * LAYOUT_SCALE
    );

}

export function getEditorContentHeight(
    lineCount: number,
    layout: BlockLayout
) {

    return (
        lineCount *
        layout.editor.lineHeight
    );

}