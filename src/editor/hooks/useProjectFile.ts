// useProjectFile.ts
// src/editor/hooks/

// Funções de:
// Leitor de aruqivo lscript
// Abrir projeto
// Salvar projeto
// Novo projeto

import { useCallback, useRef } from "react";
import type { ScriptProject } from "../../types/project";
import { EditorEngine } from "../../editor/engine/EditorEngine";

import { open, save } from "@tauri-apps/plugin-dialog";
import {
    readTextFile,
    writeTextFile,
} from "@tauri-apps/plugin-fs";
// ----------------------------------------------------------//


type Props = {
    engine: EditorEngine;
    project: ScriptProject;

    setProject: React.Dispatch<
        React.SetStateAction<ScriptProject>
    >;

    saveHistory: (
        action: string,
        details?: string
    ) => void;

    onSaved: () => void;

    setFilePath: React.Dispatch<
        React.SetStateAction<string | null>
    >;
};

export function useProjectFile({
    engine,
    project,
    setProject,
    saveHistory,
    onSaved,
    setFilePath,
}: Props) {

    // guarda arquivo atualmente associado
    const filePathRef = useRef<string | null>(null);

    // Handle File Open
    // Leitor de arquivo lscript
    const handleFileOpen = async () => {

        try {

            const selectedPath =
                await open({
                    multiple: false,
                    directory: false,
                    filters: [
                        {
                            name: "LibreScript Project",
                            extensions: ["lscript"],
                        },
                    ],
                });

            if (!selectedPath) {

                return;

            }

            const path =
                Array.isArray(selectedPath)
                    ? selectedPath[0]
                    : selectedPath;

            const content =
                await readTextFile(path);

            const loadedProject =
                JSON.parse(
                    content
                ) as ScriptProject;

            // -----------------------------------------
            // GUARDA O ARQUIVO ATUAL
            // -----------------------------------------

            filePathRef.current = path;

            setFilePath(path);

            // -----------------------------------------
            // CARREGA NO ENGINE
            // -----------------------------------------

            engine.loadDocument(
                loadedProject.blocks
            );

            // -----------------------------------------
            // ATUALIZA O PROJETO
            // -----------------------------------------

            setProject(
                loadedProject
            );

            onSaved();

            saveHistory(
                "Projeto aberto"
            );

        } catch (error) {

            console.error(
                "[OPEN] erro ao abrir projeto:",
                error
            );

            alert(
                "Não foi possível abrir o projeto."
            );

        }

    };

    // Open project
    const openProject = () => {

        void handleFileOpen();

    };

    // ===============================
    //  NOVO PROJETO
    // ===============================
    const newProject = () => {

        const confirmed =
            window.confirm(
                "Deseja criar um novo projeto? Alterações não salvas serão perdidas."
            );

        if (!confirmed) {

            return;

        }

        saveHistory(
            "Novo projeto"
        );

        filePathRef.current = null;

        setFilePath(null);

        engine.loadDocument(
            []
        );

        setProject({
            title: "",
            author: "",
            blocks: [],
        });

        onSaved();

    };

    // Função que realmente grava o arquivo
    // escreve diretamente no arquivo escolhido
    const writeProjectFile = async (
        path: string
    ) => {

        const currentBlocks =
            engine.getBlocks();

        const data: ScriptProject = {

            ...project,

            blocks:
                currentBlocks,

        };

        const json =
            JSON.stringify(
                data,
                null,
                2
            );

        await writeTextFile(
            path,
            json
        );

    };

    // =================================================
    // SALVAR COMO
    // Sempre abre o diálogo para escolher outro arquivo
    // =================================================
    const saveProjectAs = useCallback(async () => {

        try {

            const selectedPath =
                await save({

                    defaultPath:
                        `${
                            project.title.trim() ||
                            "Projeto"
                        }.lscript`,

                    filters: [

                        {
                            name:
                                "LibreScript Project",

                            extensions:
                                ["lscript"],

                        },

                    ],

                });

            if (!selectedPath) {

                return;

            }

            // -----------------------------------------
            // O NOVO ARQUIVO VIRA O ARQUIVO ATUAL
            // -----------------------------------------

            filePathRef.current = selectedPath;

            setFilePath(selectedPath);

            await writeProjectFile(
                selectedPath
            );

            onSaved();

            saveHistory(
                "Projeto salvo como"
            );

        } catch (error) {

            console.error(
                "[SAVE AS] erro:",
                error
            );

            alert(
                "Não foi possível salvar o projeto."
            );

        }

    }, [project, onSaved, setFilePath]);

    // =================================================
    // SALVAR
    // =================================================
    const saveProject = useCallback(async () => {

        // =================================================
        // JÁ EXISTE ARQUIVO ASSOCIADO
        // =================================================

        if (filePathRef.current) {

            try {

                await writeProjectFile(
                    filePathRef.current
                );

                onSaved();

                return;

            } catch (error) {

                console.error(
                    "[SAVE] erro ao salvar arquivo atual:",
                    error
                );

                alert(
                    "Não foi possível salvar o projeto."
                );

                return;

            }

        }

        // =================================================
        // PRIMEIRO SALVAMENTO
        // =================================================

        await saveProjectAs();

    }, [project, onSaved, saveProjectAs]);
// ----------------------------------------------------------------- //
    return {

        openProject,
        newProject,
        saveProject,
        saveProjectAs,
        handleFileOpen,

    };

}