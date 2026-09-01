// project.ts
// src/types/

import type { ScriptBlock } from "./script";
// ---------------------------------------------------- //

export interface ScriptTitlePage {
    enabled: boolean;
    title: string;
    subtitle: string;
    date: string;
}

export interface ScriptProject {
    title: string;
    author: string;
    blocks: ScriptBlock[];
    titlePage: ScriptTitlePage;
}