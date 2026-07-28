import type { ScriptBlock } from "../../types/script";

export class SearchService {

    search(

        blocks: ScriptBlock[],

        term: string

    ): number[] {

        if (!term.trim()) {

            return [];

        }

        return blocks

            .filter(block =>

                block.content

                    .toLowerCase()

                    .includes(

                        term.toLowerCase()

                    )

            )

            .map(block => block.id);

    }

}