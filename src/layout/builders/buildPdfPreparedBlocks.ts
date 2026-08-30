// buildPdfPreparedBlocks.ts
// src/layout/builders/

/*
===========================================================
Prepara os blocos especificamente para o pipeline do PDF.

Obtém um TextMeasurer baseado no jsPDF e utiliza o
pipeline de preparação de blocos compartilhado.

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

    doc.setFont(
        "courier",
        "normal"
    );

    doc.setFontSize(
        12
    );

    const measure =
        createPdfTextMeasurer(doc);

    return prepareBlocks(
        blocks,
        measure,
        (
            _editorLayout,
            pdfLayout
        ) => pdfLayout.compositionWidth
    );

}