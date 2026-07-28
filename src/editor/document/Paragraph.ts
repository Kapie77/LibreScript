import type { ScriptBlock } from "../../types/script";

export class Paragraph {

    private block: ScriptBlock;

    constructor(
        block: ScriptBlock
    ) {

        this.block = block;

    }

    getBlock() {

        return this.block;

    }

    get id() {

        return this.block.id;

    }

    get type() {

        return this.block.type;

    }

    get content() {

        return this.block.content;

    }

    set content(value: string) {

        this.block.content = value;

    }

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