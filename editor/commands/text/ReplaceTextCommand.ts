// ReplaceTextCommand.ts
// src/editor/commands/text/

/** =========================================
É a substituição mais básica:

um parágrafo
   ↓
posição
   ↓
remove "João"
   ↓
insere "Maria"

Tem exatamente:

paragraphId
position
removedText
insertedText

Ideal para uma ocorrência específica dentro de um único parágrafo.
============================================= */
export interface ReplaceTextCommand {

    type: "REPLACE_TEXT";

    paragraphId: number;
    position: number;
    removedText: string;
    insertedText: string;

}