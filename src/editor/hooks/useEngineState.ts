import { useEffect, useState } from "react";
import { EditorEngine } from "../engine/EditorEngine";
import type { ScriptBlock } from "../../types/script";

export function useEngineState(
    engine: EditorEngine
) {

    const [blocks, setBlocks] = useState<ScriptBlock[]>(
        engine.getBlocks()
    );

    useEffect(() => {

        const listener = (
            blocks: ScriptBlock[]
        ) => {

            setBlocks(blocks);

        };

        engine.subscribeDocumentChanged(
            listener
        );

    }, [engine]);

    return {

        blocks,

    };

}