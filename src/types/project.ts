// project.ts
// src/types/

import type { ScriptBlock } from "./script";

// ---------------------------------------------------- //

export interface ScriptSeriesInfo {
    episodeNumber: string;
    episodeTitle: string;
}

// ---------------------------------------------------- //

export interface TitlePagePrimaryCredit {
    type: TitlePageCreditType;
    name: string;
}

// ---------------------------------------------------- //

export interface TitlePageContact {
    address: string;
    phone: string;
    email: string;
}

// ---------------------------------------------------- //

// filme ou serie
export type ScriptFormat =
    | "film"
    | "series";

// draft
export type TitlePageDraftPosition =
    | "left"
    | "center"
    | "right";

// data
export type TitlePageDatePosition =
    | "left"
    | "center"
    | "right";

// imagem
export type TitlePageVisualMode =
    | "text"
    | "image"
    | "background";

    // written by e screen play by
export type TitlePageCreditType =
    | "written-by"
    | "screenplay-by";

// ---------------------------------------------------- //

export interface ScriptTitlePage {
    enabled: boolean;
    visualMode: TitlePageVisualMode;
    imagePath: string;
    title: string;
    primaryCredit: TitlePagePrimaryCredit;
    storyBy: string;
    directedBy: string;
    subtitle: string;
    basedOn: string;
    basedOnBy: string;
    draft: string;
    draftPosition: TitlePageDraftPosition;
    date: string;
    datePosition: TitlePageDatePosition;
    copyright: string;
    contact: TitlePageContact;
}

// ---------------------------------------------------- //

export interface ScriptProject {
    title: string;
    author: string;
    format: ScriptFormat;
    series: ScriptSeriesInfo;
    blocks: ScriptBlock[];
    titlePage: ScriptTitlePage;
}