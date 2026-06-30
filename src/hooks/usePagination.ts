// Calcula tudo usando o LayoutEngine
// Ele calcula a altura do Editor

// usePagination = calcula a paginação do editor.

import { useMemo } from "react";
import type { ScriptBlock } from "../types/script";
import { paginate } from "../layout/Pagination";
import type { MeasurementMap } from "../layout/types";

import { measureBlock } from "../layout/LayoutEngine";
import { getBlockLayout } from "../layout/ScriptBlockLayout";

import { PAGE_EDITOR } from "../layout/PageEditor";
// ---------------------------------------------------- //

export function usePagination(
  blocks: ScriptBlock[]
) {

  const pages =
    useMemo(() => {

      const measurements: MeasurementMap = {};

      blocks.forEach((block) => {

        const result =
          measureBlock(block);

        const layout =
          getBlockLayout(block);

        measurements[block.id] =
          result.lineCount *
          layout.editor.lineHeight +
          layout.editor.marginBottom;

      });

      return paginate(
        blocks,
        measurements,
        PAGE_EDITOR.contentHeight
      );

    }, [blocks]);

  return {

    pages,

  };

}