// buildPdfPreparedBlocks.ts
// src/layout/builders/

/*
===========================================================
Prepara os blocos especificamente para o pipeline do PDF.

Obtém um TextMeasurer baseado no jsPDF e utiliza o
PdfBlockLayout para determinar a largura usada pela
composição do texto.

===========================================================
*/

import type { jsPDF } from "jspdf";

import type { ScriptBlock } from "../../types/script";

import { prepareBlocks } from "../../layout/engine/PrepareBlocks";

import { createPdfTextMeasurer } from "../../layout/measurers/PdfTextMeasurer";

// -------------------------------------------------------------------- //

export function buildPdfPreparedBlocks(
    doc: jsPDF,
    blocks: ScriptBlock[]
) {

    const measure =
        createPdfTextMeasurer(doc);

    return prepareBlocks(
        blocks,
        measure,
        layout => layout.compositionWidth
    );

}