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
  | "transition";

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