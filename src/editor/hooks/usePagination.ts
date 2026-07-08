// Calcula tudo usando o LayoutEngine
// Ele calcula a altura do Editor

// usePagination = calcula a paginação do editor.

import { useMemo } from "react";

import { paginate } from "../../layout/engine/Pagination";
import { PAGE_EDITOR } from "../../layout/config/PageEditor";

import type { PreparedBlock } from "../../layout/core/PreparedBlock";

// ----------------------------------------------------

export function usePagination(
    preparedBlocks: PreparedBlock[]
) {

    const pages = useMemo(() =>

        paginate(
            preparedBlocks,
            PAGE_EDITOR.contentHeight,
            block => block.editorHeight
        ),

        [preparedBlocks]

    );

    return { pages };

}