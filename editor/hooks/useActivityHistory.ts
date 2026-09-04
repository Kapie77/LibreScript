// Função do histórico (desfazer e refazer)

import type { HistoryEntry } from "../../types/history";
import type { ScriptProject } from "../../types/project";
// ------------------------------------------------------------ //
type Props = {
    project: ScriptProject;

    setProject: React.Dispatch<
        React.SetStateAction<ScriptProject>
    >;

    setHistoryEntries: React.Dispatch<
        React.SetStateAction<HistoryEntry[]>
    >;
};

export function useProjectHistory({
    project,
    setHistoryEntries,
}: Props) {

    // Função para salvar estado (para o desfazer e refazer)
    const saveHistory = (
        action: string,
        details?: string
    ) => {

        const entry: HistoryEntry = {

            id: Date.now(),

            timestamp: Date.now(),

            action,

            details,

            snapshot: structuredClone(project),

        };

        setHistoryEntries(prev => [

            ...prev,

            entry,

        ]);

    };

// ------------------------------------------------------- //
    return {

        saveHistory,

    };

}