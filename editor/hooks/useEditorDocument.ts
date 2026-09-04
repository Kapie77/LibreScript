// useEditorDocument.ts
// src/editor/hooks/
import { useEffect, useRef, } from "react";
import { EditorEngine } from "../../editor/engine/EditorEngine";
import type { ScriptProject } from "../../types/project";
// --------------------------------------------------------------- //
type Props = {

    project: ScriptProject;

    setProject: React.Dispatch<
        React.SetStateAction<ScriptProject>
    >;

};

export function useEditorDocument({

    project,

    setProject,

}: Props) {

    const engineRef =
        useRef<EditorEngine | null>(null);

    if (engineRef.current === null) {

        engineRef.current =
            new EditorEngine();

    }

    const engine = engineRef.current;

    useEffect(() => {

        engine.loadDocument(

            project.blocks

        );

    }, []);


    // Use Effect
    useEffect(() => {

        const listener = (

            blocks: typeof project.blocks

        ) => {

            setProject(current => ({

                ...current,

                blocks,

            }));

        };

        const unsubscribe =

            engine.subscribeDocumentChanged(

                listener

            );

        return unsubscribe;

    }, [

        engine,
        setProject,

    ]);
    

// --------------------------------------------------------------- //
    return {

        engine,

    };

}