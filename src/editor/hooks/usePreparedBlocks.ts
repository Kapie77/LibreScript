import { useMemo } from "react";
import type { ScriptBlock } from "../../types/script";
import { prepareBlocks } from "../../layout/engine/PrepareBlocks";
import { canvasTextMeasurer } from "../../layout/measurers/CanvasTextMeasurer";
// ------------------------------------------------------------------- //
export function usePreparedBlocks(
    blocks: ScriptBlock[]
) {

    return useMemo(() =>

        prepareBlocks(
            blocks,
            canvasTextMeasurer,
            layout => layout.editor.maxWidth
        ),

        [blocks]

    );

}