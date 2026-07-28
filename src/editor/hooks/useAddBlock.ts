import type {
    MutableRefObject,
} from "react";
import type { BlockType } from "../../types/script";
import { EditorEngine } from "../../editor/engine/EditorEngine";
// -------------------------------------------------------- //

type Props = {

    engine: EditorEngine,

    saveHistory: (

        action: string,

        details?: string

    ) => void,

    lastAddedBlockId: MutableRefObject<number | null>,

}

export function useAddBlock({
    engine,
    saveHistory,
    lastAddedBlockId,
}: Props) {

    const addBlock = (
        type: BlockType,
        customContent?: string
    ) => {

        const templates = {
        scene: "INT. NEW SCENE - DAY",
        action: "New action.",

        character: "CHARACTER",
        character_contd: "CHARACTER (CONT'D)",
        character_os: "CHARACTER (O.S.)",
        character_vo: "CHARACTER (V.O.)",

        dialogue: "New dialogue.",
        parenthetical: "(whispering)",
        shot: "CLOSE UP:",
        transition: "CUT TO:"
        };

        const newBlock = {
            id: Date.now(),
            type,
            content:
                customContent ??
                templates[type],
        };

        // guarda qual foi o último bloco criado
        lastAddedBlockId.current = newBlock.id;

        saveHistory(
        "Bloco criado",
        newBlock.content
        );

        engine.insertParagraph(

            newBlock,

            -1

        );

    };

// -------------------------------------------------------- //
    return {

        addBlock,

    };

}