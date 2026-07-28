// Responsável por todo o layout dos blocos.

// Ele apenas guarda as constantes de layout
// Ele não calcula nada.
// Só fornece os valores.

// ScriptBlockLayout = define como cada tipo de bloco deve ser apresentado.

import type { ScriptBlock } from "../../types/script";
// ---------------------------------------------------- //

// Layout do Editor
export interface EditorLayout {
  className: string;
  uppercase: boolean;

  maxWidth: number;
  lineHeight: number;
  marginBottom: number;
  extraHeight: number;

  width: number;
  marginLeft: number;

  bold?: boolean;
  italic?: boolean;
  align?: "left" | "center" | "right";
}

// Layout do PDF
export interface PdfLayout {
  x: number;

  // largura usada pelo jsPDF
  renderWidth: number;

  // largura usada pelo CompositionEngine
  compositionWidth: number;

  fontStyle: "normal" | "bold";
  align: "left" | "right";

  lineHeight: number;
  marginBottom: number;
}

export interface BlockLayout {
  editor: EditorLayout;
  pdf: PdfLayout;
}

export function getBlockLayout(
  block: ScriptBlock
): BlockLayout {

  switch (block.type) {

    case "scene":
      return {
        editor: {
          className: "scene",
          uppercase: true,

          marginBottom: 18,
          maxWidth: 700,
          lineHeight: 22,
          extraHeight: 9,

          bold: true,
          italic: false,
          align: "left",

          width: 700,
          marginLeft: 0,       
        },

        pdf: {
          x: 20,
          renderWidth: 90, // jsPDF
          compositionWidth: 160, // CompositionEngine
          fontStyle: "bold",
          align: "left",
          lineHeight: 6,
          marginBottom: 4,
        },
      };

    case "action":
      return {
        editor: {
          className: "action",
          uppercase: false,

          marginBottom: 18,
          maxWidth: 700,
          lineHeight: 22,
          extraHeight: 9,

          bold: false,
          italic: false,
          align: "left",

          width: 700,
          marginLeft: 0,
        },

        pdf: {
          x: 20,
          renderWidth: 90, // jsPDF
          compositionWidth: 160, // CompositionEngine
          fontStyle: "normal",
          align: "left",
          lineHeight: 6,
          marginBottom: 4,
        },
      };

    case "character":
    case "character_contd":
    case "character_os":
    case "character_vo":
    return {
        editor: {
        className: "character",
        uppercase: true,

        marginBottom: 18,
        maxWidth: 320,
        lineHeight: 22,
        extraHeight: 9,

        bold: true,
        italic: false,
        align: "center",

        width: 320,
        marginLeft: 295,
        },

        pdf: {
        x: 90,
        renderWidth: 65, // jsPDF
        compositionWidth: 160, // CompositionEngine
        fontStyle: "bold",
        align: "left",
        lineHeight: 6,
        marginBottom: 4,
        },
    };

    case "dialogue":
      return {
        editor: {
          className: "dialogue",
          uppercase: false,

          marginBottom: 18,
          maxWidth: 420,
          lineHeight: 22,
          extraHeight: 9,

          bold: false,
          italic: false,
          align: "left",

          width: 420,
          marginLeft: 210,
        },

        pdf: {
          x: 60,
          renderWidth: 70, // jsPDF
          compositionWidth: 160, // CompositionEngine
          fontStyle: "normal",
          align: "left",
          lineHeight: 6,
          marginBottom: 4,
        },
      };

    case "parenthetical":
      return {
        editor: {
          className: "parenthetical",
          uppercase: false,

          marginBottom: 18,
          maxWidth: 280,
          lineHeight: 22,
          extraHeight: 9,

          bold: false,
          italic: true,
          align: "left",

          width: 280,
          marginLeft: 250,
        },

        pdf: {
          x: 75,
          renderWidth: 55, // jsPDF
          compositionWidth: 160, // CompositionEngine
          fontStyle: "normal",
          align: "left",
          lineHeight: 6,
          marginBottom: 4,
        },
      };

    case "shot":
      return {
        editor: {
          className: "shot",
          uppercase: true,

          marginBottom: 18,
          maxWidth: 700,
          lineHeight: 22,
          extraHeight: 9,

          bold: true,
          italic: false,
          align: "left",

          width: 700,
          marginLeft: 0,
        },

        pdf: {
          x: 20,
          renderWidth: 90, // jsPDF
          compositionWidth: 160, // CompositionEngine
          fontStyle: "bold",
          align: "left",
          lineHeight: 6,
          marginBottom: 4,
        },
      };

    case "transition":
      return {
        editor: {
          className: "transition",
          uppercase: true,

          marginBottom: 18,
          maxWidth: 700,
          lineHeight: 22,
          extraHeight: 9,

          bold: true,
          italic: false,
          align: "right",

          width: 700,
          marginLeft: 0,
        },

        pdf: {
          x: 190,
          renderWidth: 90, // jsPDF
          compositionWidth: 160, // CompositionEngine
          fontStyle: "bold",
          align: "right",
          lineHeight: 6,
          marginBottom: 4,
        },
      };

    default:
        return {
            editor: {
            className: "action",
            uppercase: false,

            marginBottom: 18,
            maxWidth: 700,
            lineHeight: 22,
            extraHeight: 9,

            bold: false,
            italic: false,
            align: "left",

            width: 700,
            marginLeft: 0,
            },

            pdf: {
            x: 20,
            renderWidth: 90, // jsPDF
            compositionWidth: 160, // CompositionEngine
            fontStyle: "normal",
            align: "left",
            lineHeight: 6,
            marginBottom: 4,
            },
        };

  }

}