// PdfLayout.ts
// src/layout/pdf/

/*
===========================================================
PdfLayout.ts

Layout visual específico do PDF.

A página A4 possui 210mm de largura.

A área útil considerada pelo LibreScript é:

    20mm esquerda
    20mm direita

Portanto:

    210 - 20 - 20 = 170mm

As larguras abaixo são a versão em milímetros da
diagramação utilizada no Editor.
===========================================================
*/

import type { ScriptBlock } from "../../types/script";

export interface PdfBlockLayout {

    x: number;

    renderWidth: number;

    compositionWidth: number;

    fontStyle:
        | "normal"
        | "bold"
        | "italic"
        | "bolditalic";

    align:
        | "left"
        | "right";

    lineHeight: number;

    marginBottom: number;

}

// =======================================================
// DIMENSÕES DA PÁGINA
// =======================================================

const PAGE_LEFT = 20;
const PAGE_RIGHT = 190;

const CONTENT_WIDTH =
    PAGE_RIGHT - PAGE_LEFT;

// =======================================================
// SCREENPLAY COLUMNS
// =======================================================

/*
Editor:

    FULL_WIDTH       = 624px
    CHARACTER_WIDTH  = 216px
    DIALOGUE_WIDTH   = 336px
    PARENTHETICAL    = 216px

Conversão aproximada:

    624px → 170mm
    336px → 91.5mm
    216px → 58.8mm
*/

// -------------------------------------------------------
// CHARACTER
// -------------------------------------------------------

const CHARACTER_WIDTH = 59;
const CHARACTER_X = 95;

// -------------------------------------------------------
// DIALOGUE
// -------------------------------------------------------

const DIALOGUE_WIDTH = 92;
const DIALOGUE_X = 56;

// -------------------------------------------------------
// PARENTHETICAL
// -------------------------------------------------------

const PARENTHETICAL_WIDTH = 59;
const PARENTHETICAL_X = 68;

// =======================================================
// ALTURA
// =======================================================

/*
O Editor usa 22px.

No PDF usamos 12pt Courier.

Aproximadamente 6mm entre linhas.
*/

const LINE_HEIGHT = 7;

// =======================================================
// LAYOUT
// =======================================================

export function getPdfBlockLayout(
    type: ScriptBlock["type"]
): PdfBlockLayout {

    switch (type) {

        // =================================================
        // SCENE
        // =================================================

        case "scene":

            return {

                x: PAGE_LEFT,

                renderWidth:
                    CONTENT_WIDTH,

                compositionWidth:
                    CONTENT_WIDTH,

                fontStyle:
                    "bold",

                align:
                    "left",

                lineHeight:
                    LINE_HEIGHT,

                marginBottom:
                    4,

            };

        // =================================================
        // ACTION
        // =================================================

        case "action":

            return {

                x: PAGE_LEFT,

                renderWidth:
                    CONTENT_WIDTH,

                compositionWidth:
                    CONTENT_WIDTH,

                fontStyle:
                    "normal",

                align:
                    "left",

                lineHeight:
                    LINE_HEIGHT,

                marginBottom:
                    4,

            };

        // =================================================
        // CHARACTER
        // =================================================

        case "character":
        case "character_os":
        case "character_vo":
        case "character_contd":

            return {

                x:
                    CHARACTER_X,

                renderWidth:
                    CHARACTER_WIDTH,

                compositionWidth:
                    CHARACTER_WIDTH,

                fontStyle:
                    "bold",

                align:
                    "left",

                lineHeight:
                    LINE_HEIGHT,

                marginBottom:
                    1,

            };

        // =================================================
        // PARENTHETICAL
        // =================================================

        case "parenthetical":

            return {

                x:
                    PARENTHETICAL_X,

                renderWidth:
                    PARENTHETICAL_WIDTH,

                compositionWidth:
                    PARENTHETICAL_WIDTH,

                fontStyle:
                    "italic",

                align:
                    "left",

                lineHeight:
                    LINE_HEIGHT,

                marginBottom:
                    1,

            };

        // =================================================
        // DIALOGUE
        // =================================================

        case "dialogue":

            return {

                x:
                    DIALOGUE_X,

                renderWidth:
                    DIALOGUE_WIDTH,

                compositionWidth:
                    DIALOGUE_WIDTH,

                fontStyle:
                    "normal",

                align:
                    "left",

                lineHeight:
                    LINE_HEIGHT,

                marginBottom:
                    4,

            };

        // =================================================
        // SHOT
        // =================================================

        case "shot":

            return {

                x:
                    PAGE_LEFT,

                renderWidth:
                    CONTENT_WIDTH,

                compositionWidth:
                    CONTENT_WIDTH,

                fontStyle:
                    "bold",

                align:
                    "left",

                lineHeight:
                    LINE_HEIGHT,

                marginBottom:
                    4,

            };

        // =================================================
        // TRANSITION
        // =================================================

        case "transition":

            return {

                x:
                    PAGE_RIGHT,

                renderWidth:
                    CONTENT_WIDTH,

                compositionWidth:
                    CONTENT_WIDTH,

                fontStyle:
                    "bold",

                align:
                    "right",

                lineHeight:
                    LINE_HEIGHT,

                marginBottom:
                    4,

            };

        // =================================================
        // DEFAULT
        // =================================================

        default:

            return {

                x:
                    PAGE_LEFT,

                renderWidth:
                    CONTENT_WIDTH,

                compositionWidth:
                    CONTENT_WIDTH,

                fontStyle:
                    "normal",

                align:
                    "left",

                lineHeight:
                    LINE_HEIGHT,

                marginBottom:
                    4,

            };

    }

}