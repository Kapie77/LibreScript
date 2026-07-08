import type { ScriptBlock } from "../../types/script";
import type { TextMeasurer } from "../measurers/TextMeasurer";
import type { PreparedBlock } from "../core/PreparedBlock";
import { getBlockLayout } from "../layouts/ScriptBlockLayout";
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
    compositionWidthSelector: (
        layout: ReturnType<typeof getBlockLayout>
    ) => number
): PreparedBlock[] {

    return blocks.map((block) => {

        const layout =
            getBlockLayout(block);

        const composition =
            composeBlock(
                block,
                compositionWidthSelector(layout),
                measure
            );
            
            // log
            console.log(
                block.id,
                composition.lines
            );

            console.log(
            "PREPARED",
            block.type,
            {
                lines: composition.lineCount,
                contentHeight: getEditorContentHeight(
                composition.lineCount,
                layout
                ),
                editorHeight: getEditorBlockHeight(
                composition.lineCount,
                layout
                ),
                pdfHeight: getPdfBlockHeight(
                composition.lineCount,
                layout
                ),
            }
            );
// ------------------------------------------------------------ //
        return {

            block,

            layout,

            composition,

            contentHeight:
                getEditorContentHeight(
                    composition.lineCount,
                    layout
                ),

            editorHeight:
                getEditorBlockHeight(
                    composition.lineCount,
                    layout
                ),

            pdfHeight:
                getPdfBlockHeight(
                    composition.lineCount,
                    layout
                ),

        };

    });

}