// Agora o Pagination.ts não conhece mais Editor nem PDF
// Ele só recebe uma altura

import type { ScriptBlock } from "../types/script";
import type { MeasurementMap } from "./types";
// --------------------------------------------------- //

export function paginate(
  blocks: ScriptBlock[],
  measurements: MeasurementMap,
  pageHeight: number
) {

  const pages: ScriptBlock[][] = [];

  let currentPage: ScriptBlock[] = [];
  let currentHeight = 0;

  for (const block of blocks) {

  const blockHeight =
    measurements[block.id] ?? 40;


  if (
    currentPage.length > 0 &&
    currentHeight + blockHeight >
    pageHeight
  ) {

    pages.push(currentPage);

    currentPage = [];
    currentHeight = 0;
  }

  currentPage.push(block);

  currentHeight += blockHeight;
}

if (currentPage.length > 0) {
  pages.push(currentPage);
}

// projeto vazio
if (pages.length === 0) {
  pages.push([]);
}


return pages;

}