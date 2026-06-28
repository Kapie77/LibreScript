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

export interface ScriptBlock {
  id: number;
  type: BlockType;
  content: string;
}