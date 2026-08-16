// Paragraph.ts
// src/editor/document/

import type { ScriptBlock } from "../../types/script";
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

        this.runs = [

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

    }

    // getRuns //
    getRuns(): TextRun[] {

        return this.runs;

    }

    // setRuns //
    setRuns(runs: TextRun[]) {

        this.runs = runs;

        this.block.content = runs
            .map(run => run.text)
            .join("");

    }

    // syncContent //
    syncContent() {

        this.block.content = this.content;

    }

    // setType //
    set type(value: ScriptBlock["type"]) {

        this.block.type = value;

    }

    updateContent(

        content: string

    ) {

        this.content = content;

    }

    updateType(

        type: ScriptBlock["type"]

    ) {

        this.type = type;

    }

}