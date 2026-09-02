// project.ts
// src/types/

import type { ScriptBlock } from "./script";

// ---------------------------------------------------- //

export type TitlePageCreditType =
    | "written-by"
    | "screenplay-by";

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

export type TitlePageDraftPosition =
    | "left"
    | "center"
    | "right";

export type TitlePageDatePosition =
    | "left"
    | "center"
    | "right";

// ---------------------------------------------------- //

export interface ScriptTitlePage {
    enabled: boolean;
    title: string;
    primaryCredit: TitlePagePrimaryCredit;
    storyBy: string;
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
    blocks: ScriptBlock[];
    titlePage: ScriptTitlePage;
}