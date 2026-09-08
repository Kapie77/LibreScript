// TextDiffService.ts
// src/editor/services/

export interface TextChange {

    type:

        | "INSERT"

        | "DELETE"

        | "REPLACE"

        | "NONE";

    removed: string;

    inserted: string;

}

export class TextDiffService {

    analyze(

        previous: string,

        current: string

    ): TextChange {

        let start = 0;

        while (

            start < previous.length &&

            start < current.length &&

            previous[start] === current[start]

        ) {

            start++;

        }

        let endPrevious =

            previous.length - 1;

        let endCurrent =

            current.length - 1;

        while (

            endPrevious >= start &&

            endCurrent >= start &&

            previous[endPrevious] === current[endCurrent]

        ) {

            endPrevious--;

            endCurrent--;

        }

        const removed =

            previous.slice(

                start,

                endPrevious + 1

            );

        const inserted =

            current.slice(

                start,

                endCurrent + 1

            );

        if (

            removed.length === 0 &&

            inserted.length === 0

        ) {

            return {

                type: "NONE",

                removed,

                inserted,

            };

        }

        if (

            removed.length === 0

        ) {

            return {

                type: "INSERT",

                removed,

                inserted,

            };

        }

        if (

            inserted.length === 0

        ) {

            return {

                type: "DELETE",

                removed,

                inserted,

            };

        }

        return {

            type: "REPLACE",

            removed,

            inserted,

        };

    }

}