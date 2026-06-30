// Responsável por todo o layout dos blocos.

// Ele apenas guarda as constantes de layout
// Ele não calcula nada.
// Só fornece os valores.

// ScriptBlockLayout = define como cada tipo de bloco deve ser apresentado.

import type { ScriptBlock } from "../types/script";
// ---------------------------------------------------- //

export interface EditorLayout {
  className: string;
  uppercase: boolean;

  charsPerLine: number;
  lineHeight: number;
  marginBottom: number;
  extraHeight: number;

  width: number;
  marginLeft: number;

  bold?: boolean;
  italic?: boolean;
  align?: "left" | "center" | "right";
}

export interface PdfLayout {
  x: number;
  maxWidth: number;
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
          charsPerLine: 61,
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
          maxWidth: 90,
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
          charsPerLine: 63,
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
          maxWidth: 90,
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
        charsPerLine: 28,
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
        maxWidth: 65,
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
          charsPerLine: 36,
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
          maxWidth: 70,
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
          charsPerLine: 32,
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
          maxWidth: 55,
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
          charsPerLine: 61,
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
          maxWidth: 90,
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
          charsPerLine: 61,
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
          maxWidth: 90,
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
            charsPerLine: 63,
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
            maxWidth: 90,
            fontStyle: "normal",
            align: "left",
            lineHeight: 6,
            marginBottom: 4,
            },
        };

  }

}