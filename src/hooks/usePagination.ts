import { useMemo, useRef, useState } from "react";

import type { ScriptBlock } from "../types/script";

import { paginate } from "../layout/Pagination";

import type { MeasurementMap } from "../layout/types";

export function usePagination(
  blocks: ScriptBlock[]
) {

  const measurementsRef =
    useRef<MeasurementMap>({});

  const [
    measurements,
    setMeasurements
  ] = useState<MeasurementMap>({});

  const animationFrame =
    useRef<number | null>(null);

  const updateMeasurement = (
    id: number,
    height: number
  ) => {

    if (
      measurementsRef.current[id] === height
    ) {
      return;
    }

    measurementsRef.current[id] = height;

    if (animationFrame.current !== null)
      return;

    animationFrame.current =
      requestAnimationFrame(() => {

        animationFrame.current = null;

        setMeasurements({
          ...measurementsRef.current,
        });

      });

  };

  const pages =
    useMemo(() => {

      return paginate(
        blocks,
        measurements
      );

    }, [blocks, measurements]);

  return {

    pages,

    updateMeasurement,

  };

}