// useSearch.ts
// src/editor/hooks/

// -------------------------------------------------------- //
// HOOK DE BUSCA
//
// Responsável por:
//
// - controlar o termo pesquisado;
// - controlar se a busca diferencia maiúsculas/minúsculas;
// - armazenar os resultados;
// - controlar o resultado atualmente selecionado;
// - navegar entre resultados;
// - manter o foco/caret do campo de busca.
//
// A lógica de encontrar os blocos pertence ao SearchService.
// A lógica visual pertence ao FileBar.
// -------------------------------------------------------- //

import {
    useEffect,
    useRef,
    useState
} from "react";

import { EditorEngine } from "../../editor/engine/EditorEngine";
import type { ScriptBlock } from "../../types/script";
import type { SearchResult } from "../services/SearchService";

// -------------------------------------------------------- //

type Props = {

    engine: EditorEngine;
    blocks: ScriptBlock[];

};

// -------------------------------------------------------- //

export function useSearch({

    engine,
    blocks,

}: Props) {

    // =====================================================
    // TERMO DA BUSCA
    // =====================================================

    const [searchTerm, setSearchTermState] =
        useState("");

    // =====================================================
    // OPÇÕES DA BUSCA
    // =====================================================

    // false = ignora maiúsculas/minúsculas
    const [caseSensitive, setCaseSensitive] =
        useState(false);

    // true = "joao" encontra "João"
    const [ignoreAccents, setIgnoreAccents] =
        useState(true);
    
    // substituir termos buscados //
    const [replaceTerm, setReplaceTerm] = useState("");

    // =====================================================
    // RESULTADOS
    // =====================================================

    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    const [currentResultIndex, setCurrentResultIndex] =
        useState(0);

    // =====================================================
    // CONTROLE DO FOCO
    // =====================================================

    const searchInputRef =
        useRef<HTMLInputElement | null>(null);

    // =====================================================
    // ALTERAR TERMO
    // =====================================================

    const setSearchTerm = (
        value: string
    ) => {

        setSearchTermState(value);

    };

    // =====================================================
    // BUSCA
    // =====================================================

    useEffect(() => {

        if (!searchTerm.trim()) {

            setSearchResults([]);

            setCurrentResultIndex(0);

            engine.clearSearchHighlights();

            return;

        }

        // -------------------------------------------------
        // EXECUTA A BUSCA
        // -------------------------------------------------

        const results =
            engine.searchBlocks(
                searchTerm,
                caseSensitive,
                ignoreAccents
            );

        // -------------------------------------------------
        // SALVA OS RESULTADOS
        // -------------------------------------------------

        setSearchResults(results);

        setCurrentResultIndex(0);

        // -------------------------------------------------
        // DESTACA OS RESULTADOS
        // -------------------------------------------------

        if (results.length > 0) {

            engine.highlightSearchResults(

                results,

                0,

                searchTerm,

                caseSensitive,

                ignoreAccents

            );

        } else {

            engine.clearSearchHighlights();

        }

        // -------------------------------------------------
        // DEVOLVE O FOCO PARA O CAMPO DE BUSCA
        // -------------------------------------------------

        requestAnimationFrame(() => {

            const input =
                searchInputRef.current;

            if (!input) {

                return;

            }

            if (
                document.activeElement !== input
            ) {

                input.focus();

            }

            // Mantém o caret no final do termo.

            const position =
                input.value.length;

            input.setSelectionRange(
                position,
                position
            );

        });

    }, [
        searchTerm,
        caseSensitive,
        ignoreAccents,
        engine,
        blocks
    ]);

    // =====================================================
    // IR PARA RESULTADO
    // =====================================================

    const goToSearchResult = (
        index: number
    ) => {

        if (
            searchResults.length === 0
        ) {

            return;

        }

        if (
            index < 0 ||
            index >= searchResults.length
        ) {

            return;

        }

        setCurrentResultIndex(
            index
        );

        engine.highlightSearchResults(

            searchResults,

            index,

            searchTerm,

            caseSensitive,

            ignoreAccents

        );

    };

    // =====================================================
    // PRÓXIMO
    // =====================================================

    const nextSearchResult = () => {

        if (
            searchResults.length === 0
        ) {

            return;

        }

        const next =
            (
                currentResultIndex + 1
            ) %
            searchResults.length;

        goToSearchResult(
            next
        );

    };

    // =====================================================
    // ANTERIOR
    // =====================================================

    const prevSearchResult = () => {

        if (
            searchResults.length === 0
        ) {

            return;

        }

        const prev =

            currentResultIndex === 0

                ? searchResults.length - 1

                : currentResultIndex - 1;

        goToSearchResult(
            prev
        );

    };

    // =====================================================
    // RETORNO
    // =====================================================

    return {

        // Busca

        searchTerm,
        setSearchTerm,

        replaceTerm,
        setReplaceTerm,

        // Opções

        caseSensitive,
        setCaseSensitive,

        ignoreAccents,
        setIgnoreAccents,

        // Resultados

        searchResults,
        currentResultIndex,

        // Navegação

        nextSearchResult,
        prevSearchResult,

        // Input

        searchInputRef,

    };

}