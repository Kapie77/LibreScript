// TextRun.ts
// src/editor/document/TextRun.ts

export interface TextRun {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    color?: string;
    backgroundColor?: string;
}