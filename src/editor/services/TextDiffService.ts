export interface TextChange {

    type:

        | "INSERT"

        | "DELETE"

        | "REPLACE"

        | "NONE";

    position: number;

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

                position: start,

                removed,

                inserted,

            };

        }

        if (

            removed.length === 0

        ) {

            return {

                type: "INSERT",

                position: start,

                removed,

                inserted,

            };

        }

        if (

            inserted.length === 0

        ) {

            return {

                type: "DELETE",

                position: start,

                removed,

                inserted,

            };

        }

        return {

            type: "REPLACE",

            position: start,

            removed,

            inserted,

        };

    }

}