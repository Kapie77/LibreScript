// Lugar responsável por calcular:
// - quebra de linha;
// - quantidade de linhas;

// O LayoutEngine não deve calcular altura. 
// Ele deve calcular apenas: 
// quebra de linhas e quantidade de linhas

// LayoutEngine = entende apenas o conteúdo e a quebra de linhas.

import type { ScriptBlock } from "../types/script";
import { getBlockLayout } from "./ScriptBlockLayout";
// ---------------------------------------------------- //

export interface LayoutResult {
  lines: string[];
  lineCount: number;
}

function wrapText(
  text: string,
  charsPerLine: number
): string[] {

  if (!text.trim()) {
    return [""];
  }

  const words =
    text.split(/\s+/);

  const lines: string[] = [];

  let currentLine = "";

  for (const word of words) {

    const testLine =
      currentLine.length === 0
        ? word
        : `${currentLine} ${word}`;

    if (
      testLine.length <= charsPerLine
    ) {

      currentLine = testLine;

    }

    else {

      if (currentLine.length > 0) {
        lines.push(currentLine);
      }

      currentLine = word;

    }

  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;

}

export function measureBlock(
  block: ScriptBlock
): LayoutResult {

  const layout =
    getBlockLayout(block);

  const content =
    layout.editor.uppercase
      ? block.content.toUpperCase()
      : block.content;

  const lines =
    wrapText(
      content,
      layout.editor.charsPerLine
    );

  return {
    lines,
    lineCount: lines.length,
  };

}