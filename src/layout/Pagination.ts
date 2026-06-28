import type { ScriptBlock } from "../types/script";
import { PAGE } from "./Page";
import type { MeasurementMap } from "./types";

export function paginate(
  blocks: ScriptBlock[],
  measurements: MeasurementMap
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
    PAGE.contentHeight
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