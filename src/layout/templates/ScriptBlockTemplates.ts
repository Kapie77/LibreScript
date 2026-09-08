// ScriptBlockTemplates.ts
// src/layout/templates/

/*
===========================================================
Responsável pelos textos padrão dos blocos.

Exemplos:

Scene
→ INT. LOCAL - DIA

Action
→ Descreva a ação.

Character
→ PERSONAGEM

Dialogue
→ Digite o diálogo.

Este arquivo NÃO possui nenhuma informação visual.

Ele apenas devolve o conteúdo inicial quando um bloco é criado.

===========================================================
*/

import type { ScriptBlock } from "../../types/script";
// ---------------------------------------------------- //
export function getDefaultBlockContent(
    type: ScriptBlock["type"]
): string {

    switch (type) {

        case "scene":
            return "INT. LOCAL - DIA";

        case "action":
            return "Descreva a ação.";

        case "character":
            return "PERSONAGEM";

        case "character_contd":
            return "PERSONAGEM (CONT'D)";

        case "character_os":
            return "PERSONAGEM (O.S.)";

        case "character_vo":
            return "PERSONAGEM (V.O.)";

        case "dialogue":
            return "Digite o diálogo.";

        case "parenthetical":
            return "(calmamente)";

        case "shot":
            return "PLANO:";

        case "transition":
            return "CORTE PARA:";

        default:
            return "";

    }

}