import type { PreparedBlock } from "../core/PreparedBlock";
// ---------------------------------------------------

export function paginate(
    preparedBlocks: PreparedBlock[],
    pageHeight: number,
    getHeight: (block: PreparedBlock) => number
) {

    const pages: PreparedBlock[][] = [];

    let currentPage: PreparedBlock[] = [];
    let currentHeight = 0;

    for (const prepared of preparedBlocks) {

        const blockHeight = getHeight(prepared);

        if (
            currentPage.length > 0 &&
            currentHeight + blockHeight > pageHeight
        ) {

            pages.push(currentPage);

            currentPage = [];
            currentHeight = 0;

        }

        currentPage.push(prepared);

        currentHeight += blockHeight;

    }

    if (currentPage.length > 0) {
        pages.push(currentPage);
    }

    // Projeto vazio (folha vazia)
    if (pages.length === 0) {
        pages.push([]);
    }

    return pages;

}