// Muda um texto para action ou dialogue ou scene etc

import type { Dispatch, SetStateAction } from "react";

import type { ScriptProject } from "../../types/project";
import type { BlockType } from "../../types/script";

// ------------------------------------------------------ //

type Props = {

    project: ScriptProject;

    setProject: Dispatch<
        SetStateAction<ScriptProject>
    >;

    saveHistory: (
        action: string,
        details?: string
    ) => void;

};

// ------------------------------------------------------ //

export function useChangeBlockType({

    project,
    setProject,
    saveHistory,

}: Props) {

    const changeBlockType = (

        id: number,

        newType: BlockType

    ) => {

        const block =
            project.blocks.find(

                (block) => block.id === id

            );

        if (!block) return;

        if (block.type === newType) return;

        saveHistory(

            "Tipo do bloco alterado",

            `${block.type} → ${newType}`

        );

        setProject({

            ...project,

            blocks: project.blocks.map(

                (block) =>

                    block.id === id

                        ? {

                            ...block,

                            type: newType,

                        }

                        : block

            ),

        });

    };

// ------------------------------------------------------ //

    return {

        changeBlockType,

    };

}