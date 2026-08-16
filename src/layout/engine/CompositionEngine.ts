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

  const words = text.split(/\s+/);

  const lines: string[] = [];

  let currentLine = "";

  for (const word of words) {

    const candidate =
      currentLine === ""
        ? word
        : currentLine + " " + word;

    if (
      measure(candidate) <= maxWidth
    ) {

      currentLine = candidate;

    }

    else {

      if (currentLine !== "") {
        lines.push(currentLine);
      }

      currentLine = word;

    }

  }

  if (currentLine !== "") {
    lines.push(currentLine);
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