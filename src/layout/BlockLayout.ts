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

// =======================================================
// PAGE CONTENT
// =======================================================

/*
A página do editor possui:

    width: 816px
    padding: 96px

Portanto:

    816 - 96 - 96 = 624px

Essa é a largura REAL disponível para o roteiro.

O padding da página já é aplicado pelo DocumentEditor.css.

Por isso NÃO devemos repetir esses 96px aqui.
*/

const CONTENT_WIDTH = 624;

const FULL_WIDTH = CONTENT_WIDTH;

// =======================================================
// SCREENPLAY COLUMNS
// =======================================================

/*
A disposição segue a convenção visual de roteiros:

SCENE / ACTION

    começam na margem esquerda da área de conteúdo.


CHARACTER

    fica deslocado para a direita.


DIALOGUE

    começa mais à esquerda que o Character.


PARENTHETICAL

    fica entre o início do Dialogue e o Character.
*/

// -------------------------------------------------------
// CHARACTER
// -------------------------------------------------------

const CHARACTER_WIDTH = 216;

/*
O centro do Character fica aproximadamente em:

255 + 108 = 363px

dentro da área de conteúdo.
*/

const CHARACTER_MARGIN_LEFT = 220;

// -------------------------------------------------------
// DIALOGUE
// -------------------------------------------------------

const DIALOGUE_WIDTH = 336;

/*
O diálogo começa mais à esquerda.

Isso permite que ele fique visualmente sob o
Character sem ficar centralizado na página.
*/

const DIALOGUE_MARGIN_LEFT = 145;

// -------------------------------------------------------
// PARENTHETICAL
// -------------------------------------------------------

const PARENTHETICAL_WIDTH = 216;

/*
O parenthetical fica entre o diálogo e o personagem.

Ele não deve ser centralizado como o Character.
*/

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

                marginLeft: 0,

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

                marginLeft: 0,

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

                marginLeft: CHARACTER_MARGIN_LEFT,

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

                marginLeft: PARENTHETICAL_MARGIN_LEFT,

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

                marginLeft: DIALOGUE_MARGIN_LEFT,

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

                marginLeft: 0,

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

                marginLeft: 0,

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

                marginLeft: 0,

                marginTop: 0,

                marginBottom: BLOCK_MARGIN_BOTTOM,

                lineHeight: 22,

            };

    }

}