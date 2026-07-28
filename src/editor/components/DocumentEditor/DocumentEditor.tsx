import "./DocumentEditor.css";
import { useEffect, useRef } from "react";
import { EditorEngine } from "../../../editor/engine/EditorEngine";
// -------------------------------------------------------- //
type Props = {

    engine: EditorEngine;

};

export default function DocumentEditor({

    engine,

}: Props) {

    const rootRef =
        useRef<HTMLDivElement>(null);

    useEffect(() => {

    if (!rootRef.current) return;

    engine.attach(rootRef.current);

    engine.render();

    return () => {

        engine.detach();

    };

}, []);

// -------------------------------------------------------- //
    return (

        <div className="document-editor">

            <div

                ref={rootRef}

                className="document-page"

            />

        </div>

    );

}