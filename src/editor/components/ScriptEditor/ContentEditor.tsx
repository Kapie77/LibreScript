import "./ScriptEditor.css";
import {
    useEffect,
    useRef,
} from "react";
// -------------------------------------------------- //

type Props = {
    value: string;

    onChange: (
        value: string
    ) => void;

    blockId: number;
    onFocus: (
        id: number
    ) => void;
};

export default function ContentEditor({
    
    value,
    onChange,
    /*onFocus,*/
    /*blockId,*/
}: Props) {

    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        if (!editorRef.current) return;

        if (
            editorRef.current.textContent !== value
        ) {

            editorRef.current.textContent = value;

        }

    }, []);

// ----------------------------------------------------- //
    return (

        <div
    ref={editorRef}
    className="content-editor"
    contentEditable
    suppressContentEditableWarning

    onClick={() => {

    }}

    onMouseDown={() => {

    }}

    onFocus={() => {

    }}

    onInput={(e) =>
        onChange(
            e.currentTarget.textContent ?? ""
        )
    }
/>

    );

}