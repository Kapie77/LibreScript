// SearchService.ts
// src/editor/services/

// =====================================================
// NORMALIZA TEXTO PARA BUSCA
// =====================================================
//
// Converte o texto para uma forma usada somente
// durante a comparação da busca.
//
// 1. NFD separa letras de seus acentos.
// 2. O replace remove as marcas de acentuação.
// 3. toLowerCase torna a busca case insensitive.
//
// Exemplo:
//
// "João" → "joao"
// "JOÃO" → "joao"
// "José" → "jose"
//
// O texto original do documento NÃO é alterado.
// =====================================================

import type { ScriptBlock } from "../../types/script";

// --------------------------------------------------- //

export type SearchOccurrence = {

    start: number;
    end: number;

};

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

        for (let i = 0; i < text.length; i++) {

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

                originalPositions.push(i);

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

    search(
        blocks: ScriptBlock[],
        term: string,
        caseSensitive: boolean = false,
        ignoreAccents: boolean = true
    ): number[] {

        if (!term.trim()) {

            return [];

        }

        const normalizedTerm =
            this.normalizeSearchText(
                term,
                caseSensitive,
                ignoreAccents
            );

        return blocks
            .filter(
                block => {

                    const normalizedContent =
                        this.normalizeSearchText(
                            block.content,
                            caseSensitive,
                            ignoreAccents
                        );

                    return normalizedContent.includes(
                        normalizedTerm
                    );

                }
            )
            .map(
                block => block.id
            );

    }

}