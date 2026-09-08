// Pagination.ts
// src/layout/engine/

import type { PreparedBlock } from "../core/PreparedBlock";
import type { PreparedBlockFragment } from "../core/PreparedBlockFragment";

// ---------------------------------------------------

export function paginate(
    preparedBlocks: PreparedBlock[],
    pageHeight: number
): PreparedBlockFragment[][] {

    const pages:
        PreparedBlockFragment[][] = [];

    let currentPage:
        PreparedBlockFragment[] = [];

    let currentHeight = 0;

    // =====================================================
    // PROCESSA CADA BLOCO
    // =====================================================

    for (
        let preparedIndex = 0;
        preparedIndex < preparedBlocks.length;
        preparedIndex++
    ) {

        const prepared =
            preparedBlocks[preparedIndex];

        const nextPrepared =
            preparedBlocks[preparedIndex + 1] ?? null;

        const lines =
            prepared.composition.lines;

        const lineHeight =
            prepared.pdfLayout.lineHeight;

        const marginBottom =
            prepared.pdfLayout.marginBottom;

        const totalLines =
            lines.length;

        // -------------------------------------------------
        // BLOCO VAZIO
        // -------------------------------------------------

        if (totalLines === 0) {

            continue;

        }

        let startLine = 0;

        // =================================================
        // DIVIDE O BLOCO EM FRAGMENTOS
        // =================================================

        while (
            startLine < totalLines
        ) {

            const remainingLines =
                totalLines - startLine;

            /*
            Quantas linhas cabem na página atual.

            Reservamos o marginBottom somente para o
            último fragmento do bloco.
            */

            const availableHeight =
                pageHeight -
                currentHeight;

            let linesThatFit =
                Math.floor(
                    availableHeight /
                    lineHeight
                );

            /*
            Se não cabe nenhuma linha na página atual,
            fechamos a página e começamos outra.
            */

            if (
                linesThatFit <= 0
            ) {

                if (
                    currentPage.length > 0
                ) {

                    pages.push(
                        currentPage
                    );

                }

                currentPage = [];

                currentHeight = 0;

                continue;

            }

            /*
            Não podemos pegar mais linhas do que
            realmente existem.
            */

            const fragmentLineCount =
                Math.min(
                    linesThatFit,
                    remainingLines
                );

            const endLine =
                startLine +
                fragmentLineCount;

            const isFirstFragment =
                startLine === 0;

            const isLastFragment =
                endLine === totalLines;

            /*
            MarginBottom só pertence ao último
            fragmento do bloco.

            Isso evita criar um espaço artificial
            no meio de um diálogo que atravessa páginas.
            */

            const fragmentHeight =
                fragmentLineCount *
                lineHeight +
                (
                    isLastFragment
                        ? marginBottom
                        : 0
                );

            // =================================================
            // REGRA CHARACTER + SPEECH
            // =================================================

            const isDialogueCharacter =
                prepared.block.type === "character" ||
                prepared.block.type === "character_contd" ||
                prepared.block.type === "character_os" ||
                prepared.block.type === "character_vo";

            const nextIsSpeech =
                nextPrepared !== null &&
                (
                    nextPrepared.block.type === "parenthetical" ||
                    nextPrepared.block.type === "dialogue"
                );

            const isWholeCharacter =
                isDialogueCharacter &&
                isFirstFragment &&
                isLastFragment;

            let characterNeedsNextPage = false;

            if (
                isWholeCharacter &&
                nextIsSpeech &&
                currentPage.length > 0
            ) {

                const nextFirstLineHeight =
                    nextPrepared!.pdfLayout.lineHeight;

                const remainingHeightAfterCharacter =
                    availableHeight -
                    fragmentHeight;

                characterNeedsNextPage =
                    remainingHeightAfterCharacter <
                    nextFirstLineHeight;

            }

            /*
            ------------------------------------------------
            CASO ESPECIAL

            Se o fragmento contém todas as linhas, mas
            com marginBottom não cabe na página atual,
            tentamos a mesma coisa em uma página nova.

            Isso evita colocar o último fragmento
            parcialmente fora da área útil.
            ------------------------------------------------
            */

            // =================================================
            // VERIFICA SE O FRAGMENTO CABE
            // =================================================

            const doesNotFit =
                currentHeight +
                    fragmentHeight >
                    pageHeight;

            // =================================================
            // CHARACTER + SPEECH
            // =================================================

            if (
                currentPage.length > 0 &&
                (
                    doesNotFit ||
                    characterNeedsNextPage
                )
            ) {

                pages.push(
                    currentPage
                );

                currentPage = [];

                currentHeight = 0;

                continue;

            }

            // ------------------------------------------------
            // CRIA FRAGMENTO
            // ------------------------------------------------

            const fragment:
                PreparedBlockFragment = {

                prepared,

                startLine,

                endLine,

                contentHeight:
                    fragmentHeight,

                isFirstFragment,

                isLastFragment,

            };

            currentPage.push(
                fragment
            );

            currentHeight +=
                fragmentHeight;

            startLine =
                endLine;

            // ------------------------------------------------
            // SE O FRAGMENTO TERMINOU O BLOCO
            // ------------------------------------------------

            if (
                isLastFragment
            ) {

                /*
                O próximo bloco começa normalmente
                depois deste.
                */

                break;

            }

            // ------------------------------------------------
            // SE A PÁGINA FICOU CHEIA
            // ------------------------------------------------

            if (
                currentHeight >=
                pageHeight
            ) {

                pages.push(
                    currentPage
                );

                currentPage = [];

                currentHeight = 0;

            }

        }

    }

    // =====================================================
    // ÚLTIMA PÁGINA
    // =====================================================

    if (
        currentPage.length > 0
    ) {

        pages.push(
            currentPage
        );

    }

    // =====================================================
    // DOCUMENTO VAZIO
    // =====================================================

    if (
        pages.length === 0
    ) {

        pages.push([]);

    }

    return pages;

}