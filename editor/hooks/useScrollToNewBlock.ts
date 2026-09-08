// Função do scroll

import { useEffect, useRef } from "react";
import type { ScriptBlock } from "../../types/script";
// --------------------------------------------------- //

type Props = {

    blocks: ScriptBlock[];

    blockRefs: React.MutableRefObject<
        Record<number, HTMLDivElement | null>
    >;

};

export function useScrollToNewBlock({

    blocks,
    blockRefs,

}: Props) {

    const lastAddedBlockId =
        useRef<number | null>(null);

    useEffect(() => {

        if (!lastAddedBlockId.current) return;

        const element =
            blockRefs.current[
                lastAddedBlockId.current
            ];

        if (!element) return;

        element.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });

        lastAddedBlockId.current = null;

    }, [blocks, blockRefs]);

// --------------------------------------------------- //
    return {

        lastAddedBlockId,

    };

}