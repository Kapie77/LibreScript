// PdfLayout.ts
// src/layout/pdf/

/*
===========================================================
PdfLayout.ts

Responsável exclusivamente pelas propriedades visuais
dos blocos durante a composição/exportação para PDF.

Este arquivo NÃO possui regras do editor HTML.

Ele NÃO define:
- conteúdo padrão dos blocos;
- comportamento de edição;
- cursor;
- seleção;
- renderização HTML.

Ele define somente como cada tipo de ScriptBlock deve ser
posicionado e dimensionado no PDF.

A arquitetura mantém o layout do Editor separado do layout
do PDF para que alterações em um não afetem o outro.

===========================================================
*/

import type { ScriptBlock } from "../../types/script";

export interface PdfBlockLayout {

    x: number;

    renderWidth: number;

    compositionWidth: number;

    fontStyle: "normal" | "bold" | "italic" | "bolditalic";

    align: "left" | "right";

    lineHeight: number;

    marginBottom: number;

}

export function getPdfBlockLayout(
    type: ScriptBlock["type"]
): PdfBlockLayout {

    switch (type) {

        case "scene":

            return {

                x: 20,
                renderWidth: 90,
                compositionWidth: 160,

                fontStyle: "bold",

                align: "left",

                lineHeight: 6,
                marginBottom: 4,

            };

        case "action":

            return {

                x: 20,
                renderWidth: 90,
                compositionWidth: 160,

                fontStyle: "normal",

                align: "left",

                lineHeight: 6,
                marginBottom: 4,

            };

        case "character":
        case "character_contd":
        case "character_os":
        case "character_vo":

            return {

                x: 90,
                renderWidth: 65,
                compositionWidth: 160,

                fontStyle: "bold",

                align: "left",

                lineHeight: 6,
                marginBottom: 4,

            };

        case "dialogue":

            return {

                x: 60,
                renderWidth: 70,
                compositionWidth: 160,

                fontStyle: "normal",

                align: "left",

                lineHeight: 6,
                marginBottom: 4,

            };

        case "parenthetical":

            return {

                x: 75,
                renderWidth: 55,
                compositionWidth: 160,

                fontStyle: "italic",

                align: "left",

                lineHeight: 6,
                marginBottom: 4,

            };

        case "shot":

            return {

                x: 20,
                renderWidth: 90,
                compositionWidth: 160,

                fontStyle: "bold",

                align: "left",

                lineHeight: 6,
                marginBottom: 4,

            };

        case "transition":

            return {

                x: 190,
                renderWidth: 90,
                compositionWidth: 160,

                fontStyle: "bold",

                align: "right",

                lineHeight: 6,
                marginBottom: 4,

            };

        default:

            return {

                x: 20,
                renderWidth: 90,
                compositionWidth: 160,

                fontStyle: "normal",

                align: "left",

                lineHeight: 6,
                marginBottom: 4,

            };

    }

}