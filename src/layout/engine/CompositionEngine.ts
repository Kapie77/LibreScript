// Agora na refaturação 2.3 o CompositionEngine vai virar um motor que só sabe responder:
// "Esse texto ocupa X linhas."
// Nada mais.

import type { ScriptBlock } from "../../types/script";
import type { TextMeasurer } from "../measurers/TextMeasurer";
import { getBlockLayout } from "../layouts/ScriptBlockLayout";

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

  const layout =
    getBlockLayout(block);

  const content =
    layout.editor.uppercase
      ? block.content.toUpperCase()
      : block.content;

  const lines = composeLines(
        content,
        availableWidth,
        measure
    );

  return {
    text: lines.join("\n"),
    lines,
    lineCount: lines.length,
  };

}