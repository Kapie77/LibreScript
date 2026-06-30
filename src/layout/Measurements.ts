import type { MeasurementMap } from "./types";

export class Measurements {

  private heights: MeasurementMap = {};

  set(
    id: number,
    height: number
  ) {
    this.heights[id] = height;
  }

  get(
    id: number
  ) {
    return this.heights[id] ?? 0;
  }

  getAll() {
    return this.heights;
  }

  remove(id: number) {
    delete this.heights[id];
  }

  clear() {
    this.heights = {};
  }

}