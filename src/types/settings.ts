// settings.ts
// src/types/
export interface Settings {

    theme: "dark" | "light";
    language: string;
    allowDeleteBlocks: boolean;
    allowMoveBlocks: boolean;
    allowCollapseScenes: boolean;
    showStatisticsButton: boolean;
    showHistoryButton: boolean;
    showNavigator: boolean;
    showToolbar: boolean;
    showStatusBar: boolean;

    pageNumberPosition:
        | "top-right"
        | "top-left"
        | "bottom-right"
        | "bottom-left"
        | "none";

}