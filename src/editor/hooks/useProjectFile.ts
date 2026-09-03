// useProjectFile.ts
// src/editor/hooks/

// Funções de:
// Leitor de arquivo lscript
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
    mkdir,
    copyFile,
} from "@tauri-apps/plugin-fs";
// ----------------------------------------------------------//

const defaultTitlePage =
    (): ScriptProject["titlePage"] => ({

        enabled: false,
        visualMode: "text",
        imagePath: "",
        title: "",
        primaryCredit: {
            type: "written-by",
            name: "",
        },
        storyBy: "",
        directedBy: "",
        subtitle: "",
        basedOn: "",
        basedOnBy: "",
        draft: "",
        draftPosition: "center",
        date: "",
        copyright: "",
        datePosition: "center",
        contact: {
            address: "",
            phone: "",
            email: "",
        },

    });

    // =============================
    // FUNÇÃO DE NORMALIZAÇÃO
    // =============================
    const normalizeTitlePage = (
        raw?: Partial<ScriptProject["titlePage"]>
    ): ScriptProject["titlePage"] => {

        const defaults =
            defaultTitlePage();

        // -----------------------------------------------------
        // PROJETO NOVO
        // -----------------------------------------------------

        if (!raw) {

            return defaults;

        }

        // -----------------------------------------------------
        // COMPATIBILIDADE COM PROJETOS ANTIGOS
        // -----------------------------------------------------

        const legacy =
            raw as Partial<
                ScriptProject["titlePage"]
            > & {

                credit?: string;

                author?: string;

            };

        let primaryCredit =
            defaults.primaryCredit;

        // -----------------------------------------------------
        // FORMATO NOVO
        // -----------------------------------------------------

        if (raw.primaryCredit) {

            primaryCredit = {

                type:
                    raw.primaryCredit.type,

                name:
                    raw.primaryCredit.name ?? "",

            };

        }

        // -----------------------------------------------------
        // FORMATO ANTIGO
        // -----------------------------------------------------

        else if (
            legacy.credit ||
            legacy.author
        ) {

            primaryCredit = {

                type:
                    legacy.credit === "screenplay-by"
                        ? "screenplay-by"
                        : "written-by",

                name:
                    legacy.author ?? "",

            };

        }

        // -----------------------------------------------------
        // RESULTADO NORMALIZADO
        // -----------------------------------------------------

        return {

            ...defaults,

            ...raw,

            primaryCredit,

            visualMode:
                raw.visualMode === "image" ||
                raw.visualMode === "background"
                    ? raw.visualMode
                    : "text",

            imagePath:
                raw.imagePath ?? "",

            storyBy:
                raw.storyBy ?? "",

            directedBy:
                raw.directedBy ?? "",

            subtitle:
                raw.subtitle ?? "",

            basedOn:
                raw.basedOn ?? "",

            basedOnBy:
                raw.basedOnBy ?? "",

            draft:
                raw.draft ?? "",

            draftPosition:
                raw.draftPosition === "left" ||
                raw.draftPosition === "right" ||
                raw.draftPosition === "center"
                    ? raw.draftPosition
                    : "center",

            date: raw.date ?? "",

            datePosition:
                raw.datePosition === "left" ||
                raw.datePosition === "right" ||
                raw.datePosition === "center"
                    ? raw.datePosition
                    : "center",

            copyright: raw.copyright ?? "",

            contact: {

                ...defaults.contact,

                ...(raw.contact ?? {}),

            },

        };

    };

    // ==================================
    // FUNÇÃO DE NORMALIZAÇÃO (SERIE)
    // ==================================
    function normalizeSeries(
        series?: Partial<ScriptProject["series"]>
    ): ScriptProject["series"] {

        return {
            episodeNumber:
                series?.episodeNumber ?? "",

            episodeTitle:
                series?.episodeTitle ?? "",
        };
    }

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

    // pega o caminho da imagem de capa (title page)
    const getProjectFilePath = () => {
        return filePathRef.current;
    };

    // função que importa o asset
    const importProjectAsset = async (
        sourcePath: string
    ): Promise<string | null> => {

        const projectPath =
            filePathRef.current;

        if (!projectPath) {

            alert(
                "Salve o projeto antes de adicionar uma imagem à página de título."
            );

            return null;

        }

        try {

            // -------------------------------------------------
            // DIRETÓRIO DO PROJETO
            // -------------------------------------------------

            const normalizedProjectPath =
                projectPath.replace(/\\/g, "/");

            const lastSlash =
                normalizedProjectPath.lastIndexOf("/");

            const projectDirectory =
                normalizedProjectPath.substring(
                    0,
                    lastSlash
                );

            // -------------------------------------------------
            // DIRETÓRIO DOS ASSETS
            // -------------------------------------------------

            const assetsDirectory =
                `${projectDirectory}/assets/title-page`;

            await mkdir(
                assetsDirectory,
                {
                    recursive: true,
                }
            );

            // -------------------------------------------------
            // NOME DO ARQUIVO
            // -------------------------------------------------

            const normalizedSourcePath =
                sourcePath.replace(/\\/g, "/");

            const sourceFileName =
                normalizedSourcePath.substring(
                    normalizedSourcePath.lastIndexOf("/") + 1
                );

            // -------------------------------------------------
            // CAMINHO FINAL
            // -------------------------------------------------

            const destinationPath =
                `${assetsDirectory}/${sourceFileName}`;

            // -------------------------------------------------
            // COPIA
            // -------------------------------------------------

            await copyFile(
                sourcePath,
                destinationPath
            );

            // -------------------------------------------------
            // CAMINHO RELATIVO AO PROJETO
            // -------------------------------------------------

            return `assets/title-page/${sourceFileName}`;

        } catch (error) {

            console.error(
                "[ASSET] erro ao importar imagem:",
                error
            );

            console.error(
                "[ASSET] sourcePath:",
                sourcePath
            );

            console.error(
                "[ASSET] projectPath:",
                projectPath
            );

            return null;

        }
    };

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

            const parsedProject =
                JSON.parse(
                    content
                ) as Partial<ScriptProject>;

            // compatibilidade com projetos antigos
            const loadedProject: ScriptProject = {
                title: parsedProject.title ?? "",

                author: parsedProject.author ?? "",

                format:
                    parsedProject.format === "series"
                        ? "series"
                        : "film",

                series:
                    normalizeSeries(
                        parsedProject.series
                    ),

                blocks:
                    parsedProject.blocks ?? [],

                titlePage:
                    normalizeTitlePage(
                        parsedProject.titlePage
                    ),
            };

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

    // ===========================
    // OPEN PROJECT
    // ===========================
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
            format: "film",
            series: {
                episodeNumber: "",
                episodeTitle: "",
            },
            blocks: [],
            titlePage: defaultTitlePage(),
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
        getProjectFilePath,
        importProjectAsset,

    };

}