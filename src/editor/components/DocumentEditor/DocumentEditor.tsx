// DocumentEditor.tsx
// src/editor/components/

import "./DocumentEditor.css";
import { useEffect, useRef } from "react";
import { EditorEngine } from "../../../editor/engine/EditorEngine";
import type { Settings } from "../../../types/settings";
import type { ScriptProject } from "../../../types/project";

// -------------------------------------------------------- //

type Props = {
    engine: EditorEngine;
    allowMoveBlocks: boolean;
    allowDeleteBlocks: boolean;
    pageNumberPosition: Settings["pageNumberPosition"];
    project: ScriptProject;
    onSave: () => void;
    onOpen: () => void;
};

// -------------------------------------------------------- //

export default function DocumentEditor({

    engine,
    project,
    allowMoveBlocks,
    allowDeleteBlocks,
    pageNumberPosition,
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
            pageNumberPosition,
            project,
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
        project,
        allowMoveBlocks,
        allowDeleteBlocks,
        pageNumberPosition,

    ]);

// -------------------------------------------------------- //

    return (

        <div className="document-editor">

            <div
                ref={rootRef}
                className="document-document"
            />

        </div>

    );

}