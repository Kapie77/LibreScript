// Função de busca (buscador)

import { useEffect, useState } from "react";
import { EditorEngine } from "../../editor/engine/EditorEngine";
// -------------------------------------------------------- //

type Props = {

    engine: EditorEngine;

    blockRefs: React.MutableRefObject<
        Record<number, HTMLDivElement | null>
    >;

};

export function useSearch({

    engine,
    blockRefs,

}: Props) {

    // Buscador (Ctrl + F)
      const [searchTerm, setSearchTerm] = useState("");
    
      const [searchResults, setSearchResults] =
      useState<number[]>([]);
    
      const [currentResultIndex, setCurrentResultIndex] =
        useState(0);
    
          // Rolar ao pesquisar por termo
          useEffect(() => {
    
            if (!searchTerm.trim()) {
    
              setSearchResults([]);
              setCurrentResultIndex(0);
    
              return;
            }
    
            const results =

              engine.searchBlocks(

                  searchTerm

              );
    
            setSearchResults(results);
    
            setCurrentResultIndex(0);
    
            if (results.length > 0) {
    
              const element =
                blockRefs.current[results[0]];
    
              element?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
    
            }
    
          }, [searchTerm, engine]);
    
              // Função para navegar entre pesquisas
              const goToSearchResult = (
                index: number
              ) => {
    
                if (
                  searchResults.length === 0
                ) return;
    
                const blockId =
                  searchResults[index];
    
                const element =
                  blockRefs.current[blockId];
    
                element?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              };
                // Próximo resultado
                const nextSearchResult = () => {
    
                  if (
                    searchResults.length === 0
                  ) return;
    
                  const next =
                    (currentResultIndex + 1)
                    % searchResults.length;
    
                  setCurrentResultIndex(next);
    
                  goToSearchResult(next);
                };
                // Resultado anterior
                const prevSearchResult = () => {
    
                  if (
                    searchResults.length === 0
                  ) return;
    
                  const prev =
                    currentResultIndex === 0
                      ? searchResults.length - 1
                      : currentResultIndex - 1;
    
                  setCurrentResultIndex(prev);
    
                  goToSearchResult(prev);
                };

    return {

        searchTerm,
        setSearchTerm,

        searchResults,
        currentResultIndex,

        nextSearchResult,
        prevSearchResult,

    };

}