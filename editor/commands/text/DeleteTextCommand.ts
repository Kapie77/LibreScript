// DeleteTextCommand.ts
// src/editor/commands/text/
export interface DeleteTextCommand {

    type: "DELETE_TEXT";

    paragraphId: number;

    position: number;

    deletedText: string;

    direction: "backward" | "forward";

}