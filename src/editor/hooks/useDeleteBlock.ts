// Função de: 
// localizar o bloco;
// pedir confirmação;
// salvar no histórico;
// remover da lista.
// Ela altera a estrutura do roteiro e ainda interage com o usuário (window.confirm).

import type { ScriptProject } from "../../types/project";
import { EditorEngine } from "../../editor/engine/EditorEngine";
// ---------------------------------------------------------------------------- //

type Props = {

    engine: EditorEngine;

    project: ScriptProject;

    saveHistory: (
        action: string,
        details?: string
    ) => void;

};

export function useDeleteBlock({

    engine,

    project,

    saveHistory,

}: Props) {

    // Função de apagar bloco
    const deleteBlock = (id: number) => {

        const block = project.blocks.find(
            (block) => block.id === id
        );

        if (!block) return;

        const confirmed = window.confirm(
            `Deseja realmente excluir:\n\n"${block.content}"?`
        );

        if (!confirmed) return;

        saveHistory(
            "Bloco excluído",
            block.content
        );

        engine.deleteParagraph(

            id

        );

    };

// -------------------------------------------------- //
    return {

        deleteBlock,

    };

}