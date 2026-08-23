// CompositionEngine.ts
// src/layout/engine/

/*
===========================================================
Responsável exclusivamente pela composição textual.

Sua função é calcular como um texto será dividido em
linhas de acordo com uma largura disponível e um
TextMeasurer.

Ele NÃO conhece:

- layout do Editor;
- layout do PDF;
- estilos;
- alinhamento;
- negrito;
- itálico;
- uppercase;
- DOM;
- ScriptBlockTemplates.

Ele apenas responde:

"Com esta largura disponível, em quantas linhas
este texto será dividido?"

===========================================================
*/

import type { ScriptBlock } from "../../types/script";
import type { TextMeasurer } from "../measurers/TextMeasurer";
// ---------------------------------------------------- //

export interface CompositionResult {
  lines: string[];
  lineCount: number;
  text: string;
}

// composeLines
function composeLines(
    text: string,
    maxWidth: number,
    measure: TextMeasurer
): string[] {

    if (!text.trim()) {
        return [""];
    }

    const lines: string[] = [];

    /*
    -------------------------------------------------------
    Divide primeiro pelas quebras de linha reais.
    -------------------------------------------------------
    */

    const paragraphs =
        text.split(/\r?\n/);

    for (const paragraph of paragraphs) {

        if (paragraph === "") {

            lines.push("");

            continue;

        }

        const words =
            paragraph.split(/\s+/);

        let currentLine = "";

        for (const word of words) {

            /*
            ------------------------------------------------
            Palavra normal
            ------------------------------------------------
            */

            const candidate =
                currentLine === ""
                    ? word
                    : currentLine + " " + word;

            if (
                measure(candidate) <= maxWidth
            ) {

                currentLine =
                    candidate;

                continue;

            }

            /*
            ------------------------------------------------
            Se a palavra inteira não couber, precisamos
            quebrá-la em partes.
            ------------------------------------------------
            */

            if (currentLine !== "") {

                lines.push(
                    currentLine
                );

                currentLine = "";

            }

            /*
            ------------------------------------------------
            Quebra palavras gigantes sem espaços.
            ------------------------------------------------
            */

            let remaining =
                word;

            while (
                remaining.length > 0
            ) {

                let chunk = "";

                for (
                    const character
                    of remaining
                ) {

                    const candidateChunk =
                        chunk + character;

                    if (
                        measure(
                            candidateChunk
                        ) <= maxWidth
                    ) {

                        chunk =
                            candidateChunk;

                    } else {

                        break;

                    }

                }

                /*
                ------------------------------------------------
                Proteção contra TextMeasurer incapaz de medir
                sequer um caractere.
                ------------------------------------------------
                */

                if (
                    chunk.length === 0
                ) {

                    chunk =
                        remaining.charAt(0);

                }

                lines.push(
                    chunk
                );

                remaining =
                    remaining.slice(
                        chunk.length
                    );

            }

        }

        if (
            currentLine !== ""
        ) {

            lines.push(
                currentLine
            );

        }

    }

    return lines;

}

// ComposeBlock
export function composeBlock(
    block: ScriptBlock,
    availableWidth: number,
    measure: TextMeasurer,
): CompositionResult {

    const lines = composeLines(
        block.content,
        availableWidth,
        measure
    );

    return {
        text: lines.join("\n"),
        lines,
        lineCount: lines.length,
    };

}