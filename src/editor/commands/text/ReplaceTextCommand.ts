export interface ReplaceTextCommand {

    type: "REPLACE_TEXT";

    paragraphId: number;
    position: number;
    removedText: string;
    insertedText: string;

}