// script.ts
// src/types/
import type { TextRun } from "../editor/document/TextRun";

export type BlockType =
  | "scene"
  | "action"
  | "character"
  | "character_contd"
  | "character_os"
  | "character_vo"
  | "dialogue"
  | "parenthetical"
  | "shot"
  | "close_up"
  | "wide_shot"
  | "pov"
  | "over_the_shoulder"
  | "transition"
  | "cut_to"
  | "fade_out"
  | "fade_in"
  | "dissolve_to"
  | "smash_cut_to";

export type ParagraphAlignment =
    | "left"
    | "center"
    | "right"
    | "justify";

export interface ScriptBlock {
  id: number;
  type: BlockType;
  content: string;
  runs?: TextRun[];
  alignment?: ParagraphAlignment;
}