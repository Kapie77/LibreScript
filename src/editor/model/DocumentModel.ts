// DocumentModel.ts
// src/editor/model/
import type { ScriptBlock } from "../../types/script";
import { Document } from "../document/Document";
import { Paragraph } from "../document/Paragraph";

export class DocumentModel {

    private document = new Document();

    load(
        blocks: ScriptBlock[]
    ) {

        this.document.load(blocks);

    }

    getDocument() {

        return this.document;

    }

    getParagraphs(): Paragraph[] {

        return this.document.getParagraphs();

    }

    getParagraphById(

        id: number

    ): Paragraph | null {

        return this.document.getParagraphById(

            id

        );

    }

    findParagraph(
        id: number
    ) {

        return this.document.findParagraph(id);

    }

    getBlocks(): ScriptBlock[] {

        return this.document
            .toScriptBlocks();

    }

    updateParagraph(

        id: number,

        content: string

    ): boolean {

        return this.document.updateParagraph(

            id,

            content

        );

    }

    insertParagraph(

        block: ScriptBlock,

        index: number

    ): boolean {

        return this.document.insertParagraph(

            block,

            index

        );

    }

    deleteParagraph(

        id: number

    ): boolean {

        return this.document.deleteParagraph(

            id

        );

    }

    moveParagraph(

        id: number,

        newIndex: number

    ): boolean {

        return this.document.moveParagraph(

            id,

            newIndex

        );

    }

    changeParagraphType(

        id: number,

        type: ScriptBlock["type"]

    ): boolean {

        return this.document.changeParagraphType(

            id,

            type

        );

    }

    splitParagraph(

        id: number,

        offset: number,

        forcedId?: number

    ): number | null {

        return this.document.splitParagraph(

            id,

            offset,

            forcedId

        );

    }

    mergeWithPrevious(

        id: number

    ) {

        return this.document.mergeWithPrevious(

            id

        );

    }

    mergeWithNext(

        id: number

    ) {

        return this.document.mergeWithNext(

            id

        );

    }

}