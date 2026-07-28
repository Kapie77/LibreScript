export interface InsertTextCommand {

    type: "INSERT_TEXT";

    paragraphId: number;

    position: number;

    text: string;

}