import type { jsPDF } from "jspdf";
import type { TextMeasurer } from "./TextMeasurer";

export function createPdfTextMeasurer(
  doc: jsPDF
): TextMeasurer {

  return (text) => doc.getTextWidth(text);

}