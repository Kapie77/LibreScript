// representa um parágrafo do documento

import type { ScriptBlock } from "../../../types/script";
// ------------------------------------------------------ //

type Props = {

    block: ScriptBlock;

};

export default function Paragraph({

    block,

}: Props) {

// ------------------------------------------------------ //

    return (

        <p
            className={block.type}
        >

            {block.content}

        </p>

    );

}