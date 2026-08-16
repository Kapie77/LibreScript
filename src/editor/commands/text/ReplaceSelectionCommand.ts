// ReplaceSelectionCommand.ts
// src/editor/commands/text/

/* =========================================
Trabalha com uma seleção já existente:

SelectionRange
      ↓
texto selecionado
      ↓
substitui por novo texto

Além da seleção ordenada, ele guarda:

selectionSnapshot

Isso é importante para preservar/restaurar a seleção e o estado do editor.

Ideal para "Substituir" quando temos uma seleção/ocorrência atual.
================================================ */

import type { OrderedSelectionRange } from "../../selection/SelectionRange";
import type { SelectionSnapshot } from "../../history/UndoData";

export interface ReplaceSelectionCommand {

    type: "REPLACE_SELECTION";

    selection: OrderedSelectionRange;

    selectionSnapshot: SelectionSnapshot;

    text: string;

}