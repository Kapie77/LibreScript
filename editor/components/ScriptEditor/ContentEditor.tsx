// ContentEditor.tsx
// src/editor/components/ScriptEditor/

import "./ScriptEditor.css";

import {
    useEffect,
    useRef,
} from "react";

// -------------------------------------------------- //

type Props = {
    value: string;
    fragmentText: string;
    onChange: (
        value: string
    ) => void;
    blockId: number;
    onFocus: (
        id: number
    ) => void;
};
// -------------------------------------------------- //

export default function ContentEditor({
    value,
    fragmentText,
    onChange,
    blockId,
    onFocus,
}: Props) {

    const editorRef = useRef<HTMLDivElement>(null);

    // -------------------------------------------------
    // ATUALIZA O TEXTO VISUAL
    // -------------------------------------------------

    useEffect(() => {

        if (!editorRef.current) {
            return;
        }

        if (
            editorRef.current.textContent !==
            fragmentText
        ) {

            editorRef.current.textContent =
                fragmentText;

        }

    }, [fragmentText]);

    // -------------------------------------------------
    // RENDER
    // -------------------------------------------------

    return (

        <div

            ref={editorRef}

            className="content-editor"

            contentEditable

            suppressContentEditableWarning

            onFocus={() => {

                onFocus(blockId);

            }}

            onInput={(event) => {

                const text =
                    event.currentTarget.textContent ?? "";

                onChange(text);

            }}

        />

    );

}