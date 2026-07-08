import type { ScriptProject } from "./project";

export interface HistoryEntry {
  id: number;
  timestamp: number;
  action: string;
  details?: string;
  snapshot: ScriptProject;
}