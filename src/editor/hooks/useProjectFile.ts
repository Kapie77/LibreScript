// Funções de:
// Leitor de aruqivo lscript
// Abrir projeto
// Salvar projeto
// Novo projeto

import type { ScriptProject } from "../../types/project";
// ----------------------------------------------------------//
type Props = {
    project: ScriptProject;
    setProject: React.Dispatch<
        React.SetStateAction<ScriptProject>
    >;

    saveHistory: (
        action: string,
        details?: string
    ) => void;

    fileInputRef: React.RefObject<HTMLInputElement | null>;
};

export function useProjectFile({
    project,
    setProject,
    saveHistory,
    fileInputRef,
}: Props) {

    // Handle File Open
    // Leitor de arquivo lscript
    const handleFileOpen = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {

        const file = event.target.files?.[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {

            try {

                const content =
                    e.target?.result as string;

                const loadedProject =
                    JSON.parse(content);

                saveHistory("Projeto aberto");

                setProject(loadedProject);

            }

            catch {

                alert("Arquivo inválido.");

            }

        };

        reader.readAsText(file);

    };

    // Open project
    const openProject = () => {
        fileInputRef.current?.click();
    };

    // New project
    const newProject = () => {
        const confirmed = window.confirm(
            "Deseja criar um novo projeto? Alterações não salvas serão perdidas."
        );

        if (!confirmed) return;

        saveHistory("Novo projeto");

        setProject({
            title: "",
            author: "",
            blocks: [],
        });
    };

    // Salvar projeto
    const saveProject = () => {
        const data = JSON.stringify(
            project,
            null,
            2
        );

        const blob = new Blob(
            [data],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        const fileName =
            project.title.trim() || "Projeto";

        link.href = url;
        link.download = `${fileName}.lscript`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

// ----------------------------------------------------------------- //
    return {

        openProject,
        newProject,
        saveProject,
        handleFileOpen,

    };

}