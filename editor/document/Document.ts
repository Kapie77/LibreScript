// Document.ts
// src/editor/document/
import type { ScriptBlock } from "../../types/script";
import { Paragraph } from "./Paragraph";
// ------------------------------------------------------ //
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

    // toScriptBlocks//
    toScriptBlocks(): ScriptBlock[] {

        return this.paragraphs.map(

            paragraph => ({

                id: paragraph.id,
                type: paragraph.type,
                content: paragraph.content,
                runs: structuredClone(paragraph.getRuns()),
                alignment: paragraph.alignment,

            })

        );

    }

    // updateParagraph //
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

    // splitParagraph //
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

        const runs = paragraph.getRuns();

        const beforeRuns: typeof runs = [];

        const afterRuns: typeof runs = [];

        let currentOffset = 0;

        for (const run of runs) {

            const runStart = currentOffset;

            const runEnd =

                currentOffset +

                run.text.length;

            // Run inteiro antes do ponto de divisão
            if (runEnd <= offset) {

                beforeRuns.push(

                    structuredClone(run)

                );

            }

            // Run inteiro depois do ponto de divisão
            else if (runStart >= offset) {

                afterRuns.push(

                    structuredClone(run)

                );

            }

            // O ponto de divisão está dentro deste run
            else {

                const splitOffset =

                    offset - runStart;

                const beforeText =

                    run.text.slice(

                        0,

                        splitOffset

                    );

                const afterText =

                    run.text.slice(

                        splitOffset

                    );

                if (beforeText.length > 0) {

                    beforeRuns.push({

                        ...structuredClone(run),

                        text: beforeText,

                    });

                }

                if (afterText.length > 0) {

                    afterRuns.push({

                        ...structuredClone(run),

                        text: afterText,

                    });

                }

            }

            currentOffset = runEnd;

        }

        paragraph.setRuns(

            beforeRuns

        );

        const newParagraph = new Paragraph({

            id: forcedId ?? Date.now(),

            type: paragraph.type,

            content: afterRuns

                .map(run => run.text)

                .join(""),

            runs: afterRuns,

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

        const mergedRuns = [

            ...structuredClone(

                previous.getRuns()

            ),

            ...structuredClone(

                current.getRuns()

            ),

        ];

        previous.setRuns(

            mergedRuns

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
    // ------------------------ //

    // merge with next //
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

        const mergedRuns = [

            ...structuredClone(

                current.getRuns()

            ),

            ...structuredClone(

                next.getRuns()

            ),

        ];

        current.setRuns(

            mergedRuns

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
    // ------------------------ //
    // ---------------------------- //

}