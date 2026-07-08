// MEDIDOR DE TEXTO
const canvas = document.createElement("canvas");

const ctx = canvas.getContext("2d")!;

ctx.font = '22px "Courier Prime", monospace';

export type TextMeasurer = (
  text: string
) => number;