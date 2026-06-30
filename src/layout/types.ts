import type { ScriptBlock } from "../types/script";

export interface BlockMeasurement {
  id: number;
  height: number;
}

export interface PageLayout {
  blocks: ScriptBlock[];
  height: number;
}

export type MeasurementMap = Record<number, number>;