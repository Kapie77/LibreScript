import type { PreparedBlock } from "../../../layout/core/PreparedBlock";

import ScriptEditor from "../ScriptEditor/ScriptEditor";
// ------------------------------------------- //

type Props = {
  prepared: PreparedBlock;

  onChange: (id: number, content: string) => void;
  onDelete: (id: number) => void;
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;

  searchTerm: string;

  setActiveBlockId: React.Dispatch<
      React.SetStateAction<number | null>
  >;
};

export default function ScriptBlock({
    prepared,
    onChange,
    onDelete,
    onMoveUp,
    onMoveDown,
    searchTerm,

    setActiveBlockId,
}: Props) {

    const {
        block,
        layout,
        contentHeight,
    } = prepared;
  
// -------------------------------------------------- //
  return (

    <div
      className={`script-block ${layout.editor.className}`}
      style={{
        width: layout.editor.width,

        marginLeft: layout.editor.marginLeft,

        paddingBottom: layout.editor.marginBottom,

        textAlign: layout.editor.align,

        fontWeight: layout.editor.bold
          ? "bold"
          : "normal",

        fontStyle: layout.editor.italic
          ? "italic"
          : "normal",
      }}
    >

    <div className="block-row">

      <div className="editor-layer">

        <ScriptEditor
            value={block.content}
            onChange={(value) =>
                onChange(block.id, value)
            }
            blockId={block.id}
            onFocus={setActiveBlockId}
        />

      </div>

      <div className="block-actions">

        <button
          className="move-block"
          onClick={() => onMoveUp(block.id)}
        >
          ⬆
        </button>

        <button
          className="move-block"
          onClick={() => onMoveDown(block.id)}
        >
          ⬇
        </button>

        <button
          className="delete-block"
          onClick={() => onDelete(block.id)}
        >
          🗑
        </button>

      </div>

    </div>

  </div>

  );
}