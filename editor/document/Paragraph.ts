// Paragraph.ts
// src/editor/document/

import type { ScriptBlock, ParagraphAlignment } from "../../types/script";
import type { TextRun } from "./TextRun";

// --------------------------------------------------------- //

export class Paragraph {

    private block: ScriptBlock;

    private runs: TextRun[];

    // constructor //
    constructor(
        block: ScriptBlock
    ) {

        this.block = block;

        this.runs = block.runs

            ? structuredClone(block.runs)

            : [

                {
                    text: block.content
                }

            ];

    }

    // getBlock //
    getBlock() {

        return this.block;

    }

    get id() {

        return this.block.id;

    }

    get type() {

        return this.block.type;

    }

    // getContent //
    get content() {

        return this.runs

            .map(run => run.text)

            .join("");

    }

    // setContent //
    set content(value: string) {

        this.runs = [

            {
                text: value
            }

        ];

        this.block.content = value;

        this.block.runs = [

            {
                text: value
            }

        ];

    }

    // getRuns //
    getRuns(): TextRun[] {

        return this.runs;

    }

    // setRuns //
    setRuns(runs: TextRun[]) {

        this.runs = structuredClone(runs);

        this.block.content = this.runs

            .map(run => run.text)

            .join("");

        this.block.runs = structuredClone(this.runs);

    }

    // syncContent //
    syncContent() {

        this.block.content = this.content;

        this.block.runs = structuredClone(this.runs);

    }

    // setType //
    set type(value: ScriptBlock["type"]) {

        this.block.type = value;

    }

    // updateContent //
    updateContent(

        content: string

    ) {

        this.content = content;

    }

    // updateType //
    updateType(

        type: ScriptBlock["type"]

    ) {

        this.type = type;

    }

    // get alignment //
    get alignment(): ParagraphAlignment {
        return this.block.alignment ?? "left";
    }

    // set alignment //
    set alignment(value: ParagraphAlignment) {
        this.block.alignment = value;
    }

}