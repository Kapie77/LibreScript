// Função de: 
// localizar o bloco;
// aplicar as regras do layout (maiúsculas etc.);
// atualizar o conteúdo.
// Ela não altera a estrutura do roteiro, apenas o conteúdo de um bloco existente.

import { EditorEngine } from "../../editor/engine/EditorEngine";
// ---------------------------------------------------------------------------- //

type Props = {
    engine: EditorEngine;
};

export function useUpdateBlock({
    engine,
}: Props) {

    const updateBlock = (
        id: number,
        content: string
    ) => {

        engine.updateParagraph(
            id,
            content
        );

    };

    return {
        updateBlock,
    };

}