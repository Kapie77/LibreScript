// DocumentEditor.tsx
// src/editor/components/

import "./DocumentEditor.css";
import { useEffect, useRef } from "react";
import { EditorEngine } from "../../../editor/engine/EditorEngine";

// -------------------------------------------------------- //

type Props = {

    engine: EditorEngine;
    allowMoveBlocks: boolean;
    allowDeleteBlocks: boolean;
    onSave: () => void;
    onOpen: () => void;

};

// -------------------------------------------------------- //

export default function DocumentEditor({

    engine,
    allowMoveBlocks,
    allowDeleteBlocks,
    onSave,
    onOpen,

}: Props) {

    const rootRef =
        useRef<HTMLDivElement>(null);

    // Mantém sempre a versão mais recente do onSave
    // sem precisar remontar o editor.
    const onSaveRef = useRef(onSave);

    useEffect(() => {

        onSaveRef.current =
            onSave;

    }, [onSave]);


    useEffect(() => {

        if (!rootRef.current) {

            return;

        }

        engine.attach(
            rootRef.current,
            allowMoveBlocks,
            allowDeleteBlocks,
            () => {
                onSaveRef.current();
            },
            onOpen
        );

        engine.render();

        return () => {

            engine.detach();

        };

    }, [

        engine,

        allowMoveBlocks,

        allowDeleteBlocks,

    ]);

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