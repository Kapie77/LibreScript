// BlockLayout.ts
// src/layout/editor/

/*
===========================================================
BlockLayout.ts

Responsável exclusivamente pela aparência visual dos
ScriptBlocks dentro do editor.

Define:

- largura;
- posição horizontal;
- alinhamento;
- caixa alta;
- negrito;
- itálico;
- altura de linha;
- espaçamento vertical.

Não cria blocos.
Não define templates.
Não renderiza HTML.
Não controla edição.
Não controla cursor.
Não controla seleção.
Não controla o PDF.

A apresentação do Editor é independente da apresentação
do PDF.
===========================================================
*/

import type { ScriptBlock } from "../types/script";
import { PAGE_EDITOR } from "./config/PageEditor";

// =======================================================
// PAGE CONTENT
// =======================================================

/*
A página do editor possui:

    width = 850px
    padding horizontal = 60px

Portanto:

    850 - 60 - 60 = 730px

O roteiro utiliza uma área interna de 624px.

Essa área é centralizada dentro dos 730px disponíveis.
*/

const CONTENT_WIDTH = 624;

const PAGE_CONTENT_WIDTH =
    PAGE_EDITOR.contentWidth;

/*
Espaço restante nas laterais da área útil:

    730 - 624 = 106px

Dividido igualmente:

    106 / 2 = 53px
*/

const CONTENT_OFFSET =
    (
        PAGE_CONTENT_WIDTH -
        CONTENT_WIDTH
    ) / 2;

const FULL_WIDTH =
    CONTENT_WIDTH;

// =======================================================
// SCREENPLAY COLUMNS
// =======================================================

// -------------------------------------------------------
// CHARACTER
// -------------------------------------------------------

const CHARACTER_WIDTH = 216;

const CHARACTER_MARGIN_LEFT = 220;

// -------------------------------------------------------
// DIALOGUE
// -------------------------------------------------------

const DIALOGUE_WIDTH = 336;

const DIALOGUE_MARGIN_LEFT = 145;

// -------------------------------------------------------
// PARENTHETICAL
// -------------------------------------------------------

const PARENTHETICAL_WIDTH = 216;

const PARENTHETICAL_MARGIN_LEFT = 235;

// =======================================================
// VERTICAL SPACING
// =======================================================

/*
Espaçamento normal entre blocos independentes.
*/

const BLOCK_MARGIN_BOTTOM = 18;

/*
Character → Parenthetical → Dialogue

fazem parte do mesmo grupo de fala.

Por isso o espaçamento vertical entre eles
é menor.
*/

const CHARACTER_MARGIN_TOP = 8;

const CHARACTER_MARGIN_BOTTOM = 2;

const PARENTHETICAL_MARGIN_TOP = 0;

const PARENTHETICAL_MARGIN_BOTTOM = 2;

const DIALOGUE_MARGIN_TOP = 0;

const DIALOGUE_MARGIN_BOTTOM = 18;

// =======================================================
// LAYOUT INTERFACE
// =======================================================

export interface EditorBlockLayout {

    className: string;

    uppercase: boolean;

    bold: boolean;

    italic: boolean;

    align: "left" | "center" | "right";

    width: number;

    maxWidth: number;

    marginLeft: number;

    marginTop: number;

    marginBottom: number;

    lineHeight: number;

}

// =======================================================
// GET EDITOR BLOCK LAYOUT
// =======================================================

export function getEditorBlockLayout(
    type: ScriptBlock["type"]
): EditorBlockLayout {

    switch (type) {

        // =================================================
        // SCENE
        // =================================================

        case "scene":

            return {

                className: "scene",

                uppercase: true,

                bold: true,

                italic: false,

                align: "left",

                width: FULL_WIDTH,

                maxWidth: FULL_WIDTH,

                marginLeft: CONTENT_OFFSET,

                marginTop: 0,

                marginBottom: BLOCK_MARGIN_BOTTOM,

                lineHeight: 22,

            };

        // =================================================
        // ACTION
        // =================================================

        case "action":

            return {

                className: "action",

                uppercase: false,

                bold: false,

                italic: false,

                align: "left",

                width: FULL_WIDTH,

                maxWidth: FULL_WIDTH,

                marginLeft: CONTENT_OFFSET,

                marginTop: 0,

                marginBottom: BLOCK_MARGIN_BOTTOM,

                lineHeight: 22,

            };

        // =================================================
        // CHARACTER
        // =================================================

        case "character":
        case "character_os":
        case "character_vo":
        case "character_contd":

            return {

                className: "character",

                uppercase: true,

                bold: true,

                italic: false,

                align: "center",

                width: CHARACTER_WIDTH,

                maxWidth: CHARACTER_WIDTH,

                marginLeft: CONTENT_OFFSET + CHARACTER_MARGIN_LEFT,

                marginTop: CHARACTER_MARGIN_TOP,

                marginBottom: CHARACTER_MARGIN_BOTTOM,

                lineHeight: 22,

            };

        // =================================================
        // PARENTHETICAL
        // =================================================

        case "parenthetical":

            return {

                className: "parenthetical",

                uppercase: false,

                bold: false,

                italic: true,

                align: "left",

                width: PARENTHETICAL_WIDTH,

                maxWidth: PARENTHETICAL_WIDTH,

                marginLeft: CONTENT_OFFSET + PARENTHETICAL_MARGIN_LEFT,

                marginTop: PARENTHETICAL_MARGIN_TOP,

                marginBottom: PARENTHETICAL_MARGIN_BOTTOM,

                lineHeight: 22,

            };

        // =================================================
        // DIALOGUE
        // =================================================

        case "dialogue":

            return {

                className: "dialogue",

                uppercase: false,

                bold: false,

                italic: false,

                align: "left",

                width: DIALOGUE_WIDTH,

                maxWidth: DIALOGUE_WIDTH,

                marginLeft: CONTENT_OFFSET + DIALOGUE_MARGIN_LEFT,

                marginTop: DIALOGUE_MARGIN_TOP,

                marginBottom: DIALOGUE_MARGIN_BOTTOM,

                lineHeight: 22,

            };

        // =================================================
        // SHOT
        // =================================================

        case "shot":

            return {

                className: "shot",

                uppercase: true,

                bold: true,

                italic: false,

                align: "left",

                width: FULL_WIDTH,

                maxWidth: FULL_WIDTH,

                marginLeft: CONTENT_OFFSET,

                marginTop: 0,

                marginBottom: BLOCK_MARGIN_BOTTOM,

                lineHeight: 22,

            };

        // =================================================
        // TRANSITION
        // =================================================

        case "transition":

            return {

                className: "transition",

                uppercase: true,

                bold: true,

                italic: false,

                align: "right",

                width: FULL_WIDTH,

                maxWidth: FULL_WIDTH,

                marginLeft: CONTENT_OFFSET,

                marginTop: 0,

                marginBottom: BLOCK_MARGIN_BOTTOM,

                lineHeight: 22,

            };

        // =================================================
        // DEFAULT
        // =================================================

        default:

            return {

                className: "action",

                uppercase: false,

                bold: false,

                italic: false,

                align: "left",

                width: FULL_WIDTH,

                maxWidth: FULL_WIDTH,

                marginLeft: CONTENT_OFFSET,

                marginTop: 0,

                marginBottom: BLOCK_MARGIN_BOTTOM,

                lineHeight: 22,

            };

    }

}