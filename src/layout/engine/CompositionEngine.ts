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

    if (text.length === 0) {

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

        /*
        ---------------------------------------------------
        Parágrafo vazio
        ---------------------------------------------------
        */

        if (paragraph.length === 0) {

            lines.push("");

            continue;

        }

        /*
        ---------------------------------------------------
        IMPORTANTE:
        
        Não usamos mais:
        
            paragraph.split(/\s+/)
        
        porque isso destruiria múltiplos espaços.
        
        Em vez disso, separamos:
        
        - palavras
        - sequências de espaços
        
        Assim:
        
        "Olá,       mundo"
        
        continua sendo:
        
        "Olá,"
        "       "
        "mundo"
        ---------------------------------------------------
        */

        const tokens =
            paragraph.match(
                /\S+|[ \t]+/g
            ) ?? [];

        let currentLine = "";

        for (const token of tokens) {

            /*
            ------------------------------------------------
            TOKEN DE ESPAÇOS
            ------------------------------------------------
            */

            if (
                /^[ \t]+$/.test(token)
            ) {

                const candidate =
                    currentLine +
                    token;

                if (
                    measure(candidate) <=
                    maxWidth
                ) {

                    currentLine =
                        candidate;

                    continue;

                }

                /*
                --------------------------------------------
                Os espaços não couberam.
                
                Mantemos a linha atual exatamente como está
                e começamos a próxima com os espaços.
                --------------------------------------------
                */

                if (
                    currentLine !== ""
                ) {

                    lines.push(
                        currentLine
                    );

                    currentLine = "";

                }

                /*
                --------------------------------------------
                Se os próprios espaços forem maiores que a
                largura disponível, quebramos a sequência.
                --------------------------------------------
                */

                let remainingSpaces =
                    token;

                while (
                    remainingSpaces.length > 0
                ) {

                    let chunk = "";

                    for (
                        const character
                        of remainingSpaces
                    ) {

                        const candidateChunk =
                            chunk +
                            character;

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
                    ----------------------------------------
                    Proteção contra TextMeasurer incapaz de
                    medir sequer um espaço.
                    ----------------------------------------
                    */

                    if (
                        chunk.length === 0
                    ) {

                        chunk =
                            remainingSpaces.charAt(0);

                    }

                    lines.push(
                        chunk
                    );

                    remainingSpaces =
                        remainingSpaces.slice(
                            chunk.length
                        );

                }

                continue;

            }

            /*
            ------------------------------------------------
            TOKEN DE PALAVRA
            ------------------------------------------------
            */

            const candidate =
                currentLine === ""
                    ? token
                    : currentLine + token;

            if (
                measure(candidate) <=
                maxWidth
            ) {

                currentLine =
                    candidate;

                continue;

            }

            /*
            ------------------------------------------------
            A palavra não coube.
            ------------------------------------------------
            */

            if (
                currentLine !== ""
            ) {

                lines.push(
                    currentLine
                );

                currentLine = "";

            }

            /*
            ------------------------------------------------
            QUEBRA PALAVRAS GIGANTES
            ------------------------------------------------
            */

            let remaining =
                token;

            while (
                remaining.length > 0
            ) {

                let chunk = "";

                for (
                    const character
                    of remaining
                ) {

                    const candidateChunk =
                        chunk +
                        character;

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

                /*
                ------------------------------------------------
                Se ainda existe texto depois deste chunk,
                ele realmente é uma quebra de palavra.
                ------------------------------------------------
                */

                if (
                    chunk.length <
                    remaining.length
                ) {

                    lines.push(
                        chunk
                    );

                } else {

                    /*
                    --------------------------------------------
                    Último pedaço da palavra.
                    Ele pode continuar na currentLine.
                    --------------------------------------------
                    */

                    currentLine =
                        chunk;

                }

                remaining =
                    remaining.slice(
                        chunk.length
                    );

            }

        }

        /*
        ---------------------------------------------------
        ÚLTIMA LINHA DO PARÁGRAFO
        ---------------------------------------------------
        */

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
// ---------------------------------------------------- //
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