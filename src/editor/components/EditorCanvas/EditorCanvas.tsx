// Responsável por:
// - desenhar páginas;
// - desenhar blocos;
// - destacar busca;
// - registrar refs.

import ScriptBlock from "../ScriptBlock/ScriptBlock";
import type { PreparedBlock } from "../../../layout/core/PreparedBlock";
// ----------------------------------------------------- //

type Props = {

    pages: PreparedBlock[][];

    searchTerm: string;

    blockRefs: React.MutableRefObject<
        Record<number, HTMLDivElement | null>
    >;

    updateBlock: (
        id: number,
        content: string
    ) => void;

    deleteBlock: (
        id: number
    ) => void;

    moveBlockUp: (
        id: number
    ) => void;

    moveBlockDown: (
        id: number
    ) => void;

    activeBlockId: number | null;

    setActiveBlockId: React.Dispatch<
        React.SetStateAction<number | null>
>;

};

export default function EditorCanvas({

    pages,
    searchTerm,
    blockRefs,

    updateBlock,
    deleteBlock,

    moveBlockUp,
    moveBlockDown,

    activeBlockId,
    setActiveBlockId,

}: Props) {

// ----------------------------------------------------- //
    return (

        <div className="pages-container">

            {pages.map(
                (page, pageIndex) => (
        
                    <div
                        key={pageIndex}
                        className="script-page"
                      >
        
                        {page.map((prepared) => {
        
                            const block = prepared.block;
        
                            const isMatch =
                                searchTerm.trim() !== "" &&
                                block.content
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase());
        
                            return (
        
                                <div
                                    key={block.id}
                                    className={
                                        isMatch
                                            ? "search-match"
                                            : ""
                                    }
                                    ref={(el) => {
        
                                        blockRefs.current[block.id] = el;
        
                                    }}
                                >
        
                                    <ScriptBlock
                                        prepared={prepared}
                                        onChange={updateBlock}
                                        onDelete={deleteBlock}
                                        onMoveUp={moveBlockUp}
                                        onMoveDown={moveBlockDown}
                                        searchTerm={searchTerm}

                                        setActiveBlockId={setActiveBlockId}
                                    />
        
                                </div>
        
                            );
        
                        })}
        
                        <div className="page-number">
                          {pageIndex + 1}
                        </div>
        
                      </div>
        
                    )
                  )}
        
        </div>

    );

}