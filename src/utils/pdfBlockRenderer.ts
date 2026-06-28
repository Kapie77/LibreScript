import type { ScriptBlock } from "../types/script";

export interface PdfBlockData {

  x: number;

  fontStyle: "normal" | "bold";

  content: string;

  maxWidth: number;

  isTransition: boolean;

}

export function getPdfBlockData(
  block: ScriptBlock
): PdfBlockData {

  let x = 20;

  let fontStyle: "normal" | "bold" =
    "normal";

  let maxWidth = 90;

  switch (block.type) {

    case "scene":
      fontStyle = "bold";
      x = 20;
      break;

    case "action":
      x = 20;
      break;

    case "character":
      fontStyle = "bold";
      x = 90;
      break;

    case "dialogue":
      x = 60;
      break;

    case "parenthetical":
      x = 75;
      break;

    case "shot":
      fontStyle = "bold";
      x = 20;
      break;

    case "transition":
      fontStyle = "bold";
      break;

  }

  let content = block.content;

  if (

    block.type === "scene" ||

    block.type === "character" ||

    block.type === "transition" ||

    block.type === "shot"

  ) {

    content = content.toUpperCase();

  }

  return {

    x,

    fontStyle,

    content,

    maxWidth,

    isTransition:
      block.type === "transition",

  };

}