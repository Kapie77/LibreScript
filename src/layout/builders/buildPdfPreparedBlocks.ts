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
        layout => layout.pdf.compositionWidth
    );

}