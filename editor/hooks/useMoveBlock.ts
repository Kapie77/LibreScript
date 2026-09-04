// Função de mover blocos para cima ou para baixo

import type { ScriptProject } from "../../types/project";

import { EditorEngine } from "../../editor/engine/EditorEngine";
// -------------------------------------------------------------- //
type Direction = "up" | "down";

type Props = {

    engine: EditorEngine;

    project: ScriptProject;

    saveHistory: (

        action: string,

        content: string

    ) => void;

};

export function useMoveBlock({
    engine,
    project,
    saveHistory,
}: Props) {

    function moveBlock(
        id: number,
        direction: Direction
    ) {

        const index =
            project.blocks.findIndex(
                block => block.id === id
            );

        if (index === -1) return;

        const targetIndex =
            direction === "up"
                ? index - 1
                : index + 1;

        if (
            targetIndex < 0 ||
            targetIndex >= project.blocks.length
        ) {
            return;
        }

        const block =
            project.blocks[index];

        saveHistory(
            direction === "up"
                ? "Bloco movido para cima"
                : "Bloco movido para baixo",
            block.content
        );

        engine.moveParagraph(

            id,

            targetIndex

        );

    }

    return {
        moveBlockUp: (id: number) =>
            moveBlock(id, "up"),

        moveBlockDown: (id: number) =>
            moveBlock(id, "down"),
    };

}