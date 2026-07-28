import type { ScriptBlock } from "./script";

export interface ScriptProject {
  title: string;
  author: string;
  blocks: ScriptBlock[];
}