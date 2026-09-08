// PrepareBlocks.ts
// src/layout/engine/

/*
===========================================================
Prepara os ScriptBlocks antes de serem utilizados pelos
motores de renderização/composição.

Para cada bloco, este arquivo obtém:

- layout do Editor;
- layout do PDF;
- composição do texto;
- altura do conteúdo no Editor;
- altura total no Editor;
- altura no PDF.

Ele NÃO renderiza HTML.
Ele NÃO renderiza PDF.
Ele apenas prepara os dados necessários para esses processos.

Editor e PDF possuem layouts independentes.

===========================================================
*/

import type { ScriptBlock } from "../../types/script";
import type { TextMeasurer } from "../measurers/TextMeasurer";
import type { PreparedBlock } from "../core/PreparedBlock";

import {
    getEditorBlockLayout,
    type EditorBlockLayout
} from "../BlockLayout";

import {
    getPdfBlockLayout,
    type PdfBlockLayout
} from "../pdf/PdfLayout";

import { composeBlock } from "./CompositionEngine";
import {
    getEditorContentHeight,
    getEditorBlockHeight,
    getPdfBlockHeight,
} from "./Geometry";
// ----------------------------------------------------------- //

export function prepareBlocks(
    blocks: ScriptBlock[],
    measure: TextMeasurer,
    getCompositionWidth?: (
        editorLayout: EditorBlockLayout,
        pdfLayout: PdfBlockLayout
    ) => number
): PreparedBlock[] {

    return blocks.map((block) => {

        const editorLayout =
            getEditorBlockLayout(
                block.type
            );

        const pdfLayout =
            getPdfBlockLayout(
                block.type
            );

        const compositionWidth =
            getCompositionWidth
                ? getCompositionWidth(
                    editorLayout,
                    pdfLayout
                )
                : editorLayout.maxWidth;

        const composition =
            composeBlock(
                block,
                compositionWidth,
                measure
            );

        return {

            block,
            editorLayout,
            pdfLayout,
            composition,
            contentHeight:
                getEditorContentHeight(
                    composition.lineCount,
                    editorLayout
                ),
            editorHeight:
                getEditorBlockHeight(
                    composition.lineCount,
                    editorLayout
                ),
            pdfHeight:
                getPdfBlockHeight(
                    composition.lineCount,
                    pdfLayout
                ),

        };

    });

}