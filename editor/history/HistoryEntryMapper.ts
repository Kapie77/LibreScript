// HistoryEntryMapper.ts
// src/editor/history/

import type { ExecutedCommand } from "./ExecutedCommand";
import type { HistoryEntry } from "../../types/history";

export function mapExecutedCommandToHistoryEntry(
    executed: ExecutedCommand
): HistoryEntry {

    const command = executed.command;

    let action = "Operação realizada";
    let details: string | undefined;

    switch (command.type) {

        case "INSERT_TEXT":
            action = "Texto inserido";
            details = command.text;
            break;

        case "DELETE_TEXT":
            action = "Texto excluído";
            details = command.deletedText;
            break;

        case "REPLACE_TEXT":
            action = "Texto substituído";
            break;

        case "REPLACE_SELECTION":
            action = "Seleção substituída";
            break;

        case "REPLACE_SELECTION_MULTI":
            action = "Seleção substituída";
            break;

        case "REPLACE_ALL":
            action = "Texto substituído";
            break;

        case "INSERT_PARAGRAPH":
            action = "Bloco criado";
            details = command.block.content;
            break;

        case "DELETE_PARAGRAPH":
            action = "Bloco excluído";
            break;

        case "MOVE_PARAGRAPH":
            action = "Bloco movido";
            break;

        case "SPLIT_PARAGRAPH":
            action = "Bloco dividido";
            break;

        case "MERGE_PREVIOUS":
            action = "Blocos mesclados";
            break;

        case "MERGE_NEXT":
            action = "Blocos mesclados";
            break;

        case "CHANGE_BLOCK_TYPE":
            action = "Tipo do bloco alterado";
            details = command.blockType;
            break;

        case "TOGGLE_BOLD":
            action = "Negrito alternado";
            break;

        case "TOGGLE_ITALIC":
            action = "Itálico alternado";
            break;

        case "TOGGLE_UNDERLINE":
            action = "Sublinhado alternado";
            break;

        case "TOGGLE_STRIKE":
            action = "Tachado alternado";
            break;

        case "SET_PARAGRAPH_ALIGNMENT":
            action = "Alinhamento alterado";
            details = command.alignment;
            break;

        case "LOWERCASE_TEXT":
            action = "Texto transformado em minúsculas";
            break;

        case "UPPERCASE_TEXT":
            action = "Texto transformado em maiúsculas";
            break;

        case "PASTE_MULTI_PARAGRAPH":
            action = "Texto colado";
            break;

        case "UPDATE_PARAGRAPH":
            action = "Bloco atualizado";
            break;

        default:
            break;
    }

    return {
        id: executed.timestamp,
        timestamp: executed.timestamp,
        commandType: command.type,
        action,
        details,
    };
}