//Document.ts
import type { ScriptBlock } from "../../types/script";
import { Paragraph } from "./Paragraph";

export class Document {

    private paragraphs: Paragraph[] = [];

    load(

        blocks: ScriptBlock[]

    ) {

        this.paragraphs =

            blocks.map(

                block =>

                    new Paragraph(block)

            );

    }

    getParagraphs() {

        return this.paragraphs;

    }

    getParagraphById(

        id: number

    ): Paragraph | null {

        return (

            this.paragraphs.find(

                paragraph => paragraph.id === id

            ) ?? null

        );

    }

    findParagraph(

        id: number

    ) {

        return this.paragraphs.find(

            p => p.id === id

        );

    }

    toScriptBlocks(): ScriptBlock[] {

        return this.paragraphs.map(

            paragraph => ({

                id: paragraph.id,

                type: paragraph.type,

                content: paragraph.content,

            })

        );

    }

    updateParagraph(

        id: number,

        content: string

    ): boolean {

        const paragraph =

            this.findParagraph(id);

        if (!paragraph) {

            return false;

        }

        paragraph.updateContent(

            content

        );

        return true;

    }

    deleteParagraph(

        id: number

    ): boolean {

        const index =

            this.paragraphs.findIndex(

                paragraph => paragraph.id === id

            );

        if (index === -1) {

            return false;

        }

        this.paragraphs.splice(

            index,

            1

        );

        return true;

    }

    insertParagraph(

        block: ScriptBlock,

        index: number

    ): boolean {

        const paragraph =

            new Paragraph(block);

        if (

            index < 0 ||

            index > this.paragraphs.length

        ) {

            this.paragraphs.push(

                paragraph

            );

        } else {

            this.paragraphs.splice(

                index,

                0,

                paragraph

            );

        }

        return true;

    }

    moveParagraph(

        id: number,

        newIndex: number

    ): boolean {

        const currentIndex =

            this.paragraphs.findIndex(

                paragraph => paragraph.id === id

            );

        if (currentIndex === -1) {

            return false;

        }

        if (

            newIndex < 0 ||

            newIndex >= this.paragraphs.length

        ) {

            return false;

        }

        const [paragraph] =

            this.paragraphs.splice(

                currentIndex,

                1

            );

        this.paragraphs.splice(

            newIndex,

            0,

            paragraph

        );

        return true;

    }

    changeParagraphType(

        id: number,

        type: ScriptBlock["type"]

    ): boolean {

        const paragraph =

            this.findParagraph(id);

        if (!paragraph) {

            return false;

        }

        paragraph.updateType(type);

        return true;

    }

    splitParagraph(

        id: number,

        offset: number,

        forcedId?: number

    ): number | null {

        const index = this.paragraphs.findIndex(

            paragraph => paragraph.id === id

        );

        if (index === -1) {

            return null;

        }

        const paragraph = this.paragraphs[index];

        const before =

            paragraph.content.slice(

                0,

                offset

            );

        const after =

            paragraph.content.slice(

                offset

            );

        paragraph.updateContent(before);

        const newParagraph = new Paragraph({

            id: forcedId ?? Date.now(),

            type: paragraph.type,

            content: after,

        });

        this.paragraphs.splice(

            index + 1,

            0,

            newParagraph

        );

        return newParagraph.id;

    }

    // merge with previous //
    mergeWithPrevious(

        id: number

    ): {

        paragraphId: number;

        offset: number;

    } | null {

        const index = this.paragraphs.findIndex(

            paragraph => paragraph.id === id

        );

        if (index <= 0) {

            return null;

        }

        const previous = this.paragraphs[index - 1];
        const current = this.paragraphs[index];

        const caretPosition =
            previous.content.length;

        previous.updateContent(

            previous.content + current.content

        );

        this.paragraphs.splice(

            index,

            1

        );

        return {

            paragraphId: previous.id,

            offset: caretPosition,

        };

    }
    // ------------------------ //

    // merge with previous
    mergeWithNext(

        id: number

    ): {

        paragraphId: number;

        offset: number;

    } | null {

        const index = this.paragraphs.findIndex(

            paragraph => paragraph.id === id

        );

        if (

            index === -1 ||

            index >= this.paragraphs.length - 1

        ) {

            return null;

        }

        const current =

            this.paragraphs[index];

        const next =

            this.paragraphs[index + 1];

        const caretPosition =

            current.content.length;

        current.updateContent(

            current.content +

            next.content

        );

        this.paragraphs.splice(

            index + 1,

            1

        );

        return {

            paragraphId:

                current.id,

            offset:

                caretPosition,

        };

    }

}