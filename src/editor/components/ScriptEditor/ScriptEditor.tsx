import "./ScriptEditor.css";

import ContentEditor from "./ContentEditor";

// ----------------------------------------------- //

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

export default function ScriptEditor({

    value,
    onChange,
    blockId,
    onFocus,

}: Props) {

    return (

        <ContentEditor
            value={value}
            onChange={onChange}
            blockId={blockId}
            onFocus={onFocus}
        />

    );

}