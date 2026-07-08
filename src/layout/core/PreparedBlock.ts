import type { ScriptBlock } from "../../types/script";
import type { BlockLayout } from "../layouts/ScriptBlockLayout";
import type { CompositionResult } from "../engine/CompositionEngine";
// ------------------------------------------------------------ //
export interface PreparedBlock {

    block: ScriptBlock;

    layout: BlockLayout;

    composition: CompositionResult;

    contentHeight: number;

    editorHeight: number;

    pdfHeight: number;

}