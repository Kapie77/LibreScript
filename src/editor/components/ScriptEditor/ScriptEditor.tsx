// ScriptEditor.tsx
// src/editor/components/ScriptEditor/

import "./ScriptEditor.css";
import ContentEditor from "./ContentEditor";
// ----------------------------------------------- //

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

export default function ScriptEditor({

    value,
    fragmentText,
    onChange,
    blockId,
    onFocus,

}: Props) {

    return (

        <ContentEditor
            value={value}
            fragmentText={fragmentText}
            onChange={onChange}
            blockId={blockId}
            onFocus={onFocus}
        />

    );

}