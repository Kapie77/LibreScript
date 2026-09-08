// history.ts
// src/types/

export interface HistoryEntry {
  id: number;
  timestamp: number;
  commandType: string;
  action: string;
  details?: string;
}