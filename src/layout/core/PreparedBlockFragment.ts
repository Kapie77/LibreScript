// PreparedBlockFragment.ts
// src/layout/core/

/*
===========================================================
Representa uma parte visual de um PreparedBlock.

Um ScriptBlock continua sendo um único bloco lógico.

Quando seu conteúdo ultrapassa uma página, ele pode ser
dividido em vários PreparedBlockFragment.

Exemplo:

    ScriptBlock #10
          |
          +-- Fragment 1 → página 1
          |
          +-- Fragment 2 → página 2
          |
          +-- Fragment 3 → página 3

Os fragmentos NÃO criam novos ScriptBlocks.

Eles existem apenas para controlar a apresentação
do mesmo bloco dentro das páginas do Editor.
===========================================================
*/

import type { PreparedBlock } from "./PreparedBlock";

export interface PreparedBlockFragment {

    prepared: PreparedBlock;

    /*
    Índice da primeira linha deste fragmento
    dentro de prepared.composition.lines.
    */

    startLine: number;

    /*
    Índice exclusivo da última linha.

    Exemplo:

        startLine = 0
        endLine = 43

    significa linhas:

        0 até 42
    */

    endLine: number;

    /*
    Altura visual deste fragmento.
    */

    contentHeight: number;

    /*
    Indica se este é o primeiro fragmento
    do bloco original.
    */

    isFirstFragment: boolean;

    /*
    Indica se este é o último fragmento
    do bloco original.
    */

    isLastFragment: boolean;

}