// HistoryManager.ts
// src/editor/history/

import type { ExecutedCommand } from "../history/ExecutedCommand";
import type { InsertTextCommand } from "../commands/text/InsertTextCommand";
import type { DeleteTextCommand } from "../commands/text/DeleteTextCommand";
import type { UpdateParagraphUndoData } from "./UndoData";
// ----------------------------------------------------------------------------- //

const MERGE_TIME = 500; // timestramp

// CLASSE //
export class HistoryManager {

    private undoStack: ExecutedCommand[] = [];
    private redoStack: ExecutedCommand[] = [];
    private forceNewGroup = false;

    breakMergeGroup() {

        this.forceNewGroup = true;

    }

    // adiciona um comando ao histórico
    push(command: ExecutedCommand) {

        if (this.forceNewGroup) {

            this.forceNewGroup = false;

            this.undoStack.push(command);

            this.redoStack = [];

            return;

        }

        const last =

            this.undoStack[

                this.undoStack.length - 1

            ];
        //
        if (

            last &&
            last.command.type === "INSERT_TEXT" &&
            command.command.type === "INSERT_TEXT" &&

            command.timestamp - last.timestamp < MERGE_TIME

        ) {

            const lastCommand =

                last.command as InsertTextCommand;

            const newCommand =

                command.command as InsertTextCommand;

            if (

                lastCommand.paragraphId === newCommand.paragraphId &&

                newCommand.position ===

                    lastCommand.position +

                    lastCommand.text.length

            ) {

                lastCommand.text +=

                    newCommand.text;

                (last.undoData as UpdateParagraphUndoData).newContent =
                    (command.undoData as UpdateParagraphUndoData).newContent;
                
                last.caretAfter = command.caretAfter;

                this.redoStack = [];

                return;

            }

        }
        //

        //
        if (

            last &&
            last.command.type === "DELETE_TEXT" &&
            command.command.type === "DELETE_TEXT" &&

            command.timestamp - last.timestamp < MERGE_TIME

        ) {

            const lastCommand =

                last.command as DeleteTextCommand;

            const newCommand =

                command.command as DeleteTextCommand;

            if (

                lastCommand.paragraphId === newCommand.paragraphId &&

                newCommand.position + newCommand.deletedText.length ===

                lastCommand.position

            ) {

                lastCommand.deletedText =

                    newCommand.deletedText +

                    lastCommand.deletedText;

                lastCommand.position =

                    newCommand.position;

                (last.undoData as UpdateParagraphUndoData).newContent =
                    (command.undoData as UpdateParagraphUndoData).newContent;

                last.caretAfter = command.caretAfter;

                last.timestamp = command.timestamp;

                this.redoStack = [];

                return;

            }

        }

        //

        this.undoStack.push(command);

        this.redoStack = [];

    }

    // desfazer
    undo(): ExecutedCommand | null {

        const command =

            this.undoStack.pop();

        if (!command) {

            return null;

        }

        this.redoStack.push(command);

        return command;

    }

    // refazer
    redo(): ExecutedCommand | null {

        const command = this.redoStack.pop();

        if (!command) {

            return null;

        }

        this.undoStack.push(command);

        return command;

    }

    clear() {

        this.undoStack = [];

        this.redoStack = [];

    }

    getUndoSize() {

        return this.undoStack.length;

    }

    getRedoSize() {

        return this.redoStack.length;

    }

}