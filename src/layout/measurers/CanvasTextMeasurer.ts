import type { TextMeasurer } from "./TextMeasurer";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;

ctx.font = '22px "Courier Prime", monospace';

export const canvasTextMeasurer: TextMeasurer = (
  text
) => ctx.measureText(text).width;