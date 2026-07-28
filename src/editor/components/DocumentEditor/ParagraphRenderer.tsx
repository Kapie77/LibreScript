import type { ScriptBlock } from "../../../types/script";
import { getBlockLayout } from "../../../layout/layouts/ScriptBlockLayout";

import {
    useEffect,
    useRef,
} from "react";

import { EditorEngine } from "../../../editor/engine/EditorEngine";
// -------------------------------------------------------------------- //

type Props = {

    block: ScriptBlock;

    engine: EditorEngine;

    onChange: (
        id: number,
        content: string
    ) => void;

};

export default function ParagraphRenderer ({
    block,
    /*engine,*/
    /*onChange,*/
}: Props) {

    // editorref
    const editorRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {

        const editor = editorRef.current;

        if (!editor) return;

        // Se o usuário está editando,
        // não mexe no conteúdo.
        if (

            document.activeElement === editor

        ) {

            return;

        }

        if (

            editor.textContent !== block.content

        ) {

            editor.textContent = block.content;

        }

    }, [block.content]);

    // layout
    const layout = getBlockLayout(block);

    useEffect(() => {

    return () => {

    };

}, []);

// ----------------------------------------------------------------- //
    return (

        <p
    ref={editorRef}

    contentEditable

    tabIndex={0}

    suppressContentEditableWarning

    className={layout.editor.className}

    style={{
        width: layout.editor.width,
        marginLeft: layout.editor.marginLeft,
        marginBottom: layout.editor.marginBottom,
        textAlign: layout.editor.align,
        fontWeight: layout.editor.bold ? "bold" : "normal",
        fontStyle: layout.editor.italic ? "italic" : "normal",
        whiteSpace: "pre-wrap",
    }}

    onClick={() => {


    }}

    onMouseDown={() => {


    }}

    onFocus={() => {

        alert("FOCUS");

    }}

    onBlur={() => {


    }}
>
    {block.content}
</p>

    );

}