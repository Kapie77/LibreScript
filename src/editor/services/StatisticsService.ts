import type { ScriptBlock } from "../../types/script";

export class StatisticsService {

    getStatistics(

        blocks: ScriptBlock[]

    ) {

        const stats = {

            scenes: blocks.filter(
                block => block.type === "scene"
            ).length,

            actions: blocks.filter(
                block => block.type === "action"
            ).length,

            characters: blocks.filter(
                block => block.type === "character"
            ).length,

            dialogues: blocks.filter(
                block => block.type === "dialogue"
            ).length,

            transitions: blocks.filter(
                block => block.type === "transition"
            ).length,

            total: blocks.length,

        };

        const wordCount =
            blocks
                .map(block => block.content)
                .join(" ")
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .length;

        const charCount =
            blocks
                .map(block => block.content)
                .join("")
                .length;

        return {

            stats,

            wordCount,

            charCount,

        };

    }

}