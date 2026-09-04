import { useMemo } from "react";
import type { ScriptBlock } from "../../types/script";
import { StatisticsService } from "../../editor/services/StatisticsService";
// -------------------------------------------------------------------------- //
const statistics = new StatisticsService();

export function useEditorStatistics(
    blocks: ScriptBlock[]
) {
    
// -------------------------------------------------------------------------- //
    return useMemo(

        () => statistics.getStatistics(blocks),

        [blocks]

    );

}