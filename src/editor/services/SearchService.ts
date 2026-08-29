// SearchService.ts
// src/editor/services/

// =====================================================
// NORMALIZA TEXTO PARA BUSCA
// =====================================================
//
// Converte o texto para uma forma usada somente
// durante a comparação da busca.
//
// O texto original do documento NÃO é alterado.
// =====================================================

import type { ScriptBlock } from "../../types/script";

// --------------------------------------------------- //

export type SearchOccurrence = {

    start: number;
    end: number;

};

// =====================================================
// RESULTADO DE BUSCA
// =====================================================
//
// Cada resultado representa UMA ocorrência.
//
// Um mesmo parágrafo pode aparecer várias vezes:
//
// [
//     { paragraphId: 10, occurrenceIndex: 0 },
//     { paragraphId: 10, occurrenceIndex: 1 },
//     { paragraphId: 10, occurrenceIndex: 2 },
// ]
//
// =====================================================

export type SearchResult = {

    paragraphId: number;

    occurrenceIndex: number;

};

// --------------------------------------------------- //

export class SearchService {

    // =====================================================
    // NORMALIZA TEXTO PARA BUSCA
    // =====================================================

    private normalizeSearchText(
        text: string,
        caseSensitive: boolean,
        ignoreAccents: boolean
    ): string {

        let normalized =
            text;

        // ---------------------------------------------
        // REMOVE ACENTOS
        // ---------------------------------------------

        if (ignoreAccents) {

            normalized =
                normalized
                    .normalize("NFD")
                    .replace(
                        /[\u0300-\u036f]/g,
                        ""
                    );

        }

        // ---------------------------------------------
        // CASE SENSITIVE
        // ---------------------------------------------

        if (!caseSensitive) {

            normalized =
                normalized.toLocaleLowerCase();

        }

        return normalized;

    }

    // =====================================================
    // MÉTODO PARA LOCALIZAR POSIÇÕES
    // =====================================================

    findOccurrences(
        text: string,
        term: string,
        caseSensitive: boolean = false,
        ignoreAccents: boolean = true
    ): SearchOccurrence[] {

        if (!term.trim()) {

            return [];

        }

        let normalizedText = "";

        const originalPositions: number[] = [];

        // -------------------------------------------------
        // NORMALIZA O TEXTO
        // MANTENDO O MAPA PARA AS POSIÇÕES ORIGINAIS
        // -------------------------------------------------

        for (
            let i = 0;
            i < text.length;
            i++
        ) {

            let character =
                text[i];

            if (ignoreAccents) {

                character =
                    character
                        .normalize("NFD")
                        .replace(
                            /[\u0300-\u036f]/g,
                            ""
                        );

            }

            if (!caseSensitive) {

                character =
                    character.toLocaleLowerCase();

            }

            for (
                const normalizedCharacter of character
            ) {

                normalizedText +=
                    normalizedCharacter;

                originalPositions.push(
                    i
                );

            }

        }

        // -------------------------------------------------
        // NORMALIZA O TERMO
        // -------------------------------------------------

        const normalizedTerm =
            this.normalizeSearchText(
                term,
                caseSensitive,
                ignoreAccents
            );

        if (!normalizedTerm) {

            return [];

        }

        // -------------------------------------------------
        // PROCURA AS OCORRÊNCIAS
        // -------------------------------------------------

        const occurrences:
            SearchOccurrence[] = [];

        let searchStart = 0;

        while (true) {

            const index =
                normalizedText.indexOf(
                    normalizedTerm,
                    searchStart
                );

            if (index === -1) {

                break;

            }

            const normalizedEnd =
                index +
                normalizedTerm.length;

            const originalStart =
                originalPositions[index];

            const lastNormalizedPosition =
                normalizedEnd - 1;

            const originalEnd =
                originalPositions[
                    lastNormalizedPosition
                ] + 1;

            occurrences.push({

                start:
                    originalStart,

                end:
                    originalEnd,

            });

            searchStart =
                normalizedEnd;

        }

        return occurrences;

    }

    // =====================================================
    // BUSCA
    // =====================================================
    //
    // ANTES:
    //
    //   number[]
    //
    // Cada parágrafo aparecia apenas uma vez.
    //
    // AGORA:
    //
    //   SearchResult[]
    //
    // Cada ocorrência vira um resultado independente.
    //
    // =====================================================

    search(
        blocks: ScriptBlock[],
        term: string,
        caseSensitive: boolean = false,
        ignoreAccents: boolean = true
    ): SearchResult[] {

        if (!term.trim()) {

            return [];

        }

        const results:
            SearchResult[] = [];

        // -------------------------------------------------
        // PERCORRE OS BLOCOS NA ORDEM DO DOCUMENTO
        // -------------------------------------------------

        for (
            const block of blocks
        ) {

            const occurrences =
                this.findOccurrences(
                    block.content,
                    term,
                    caseSensitive,
                    ignoreAccents
                );

            // -------------------------------------------------
            // CADA OCORRÊNCIA É UM RESULTADO
            // -------------------------------------------------

            for (
                let occurrenceIndex = 0;
                occurrenceIndex < occurrences.length;
                occurrenceIndex++
            ) {

                results.push({

                    paragraphId:
                        block.id,

                    occurrenceIndex,

                });

            }

        }

        return results;

    }

}