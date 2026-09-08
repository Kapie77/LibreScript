// ScriptBlock.tsx
// sr/ceditor/components/ScriptBlock/

import ScriptEditor from "../ScriptEditor/ScriptEditor";
import type { PreparedBlockFragment } from "../../../layout/core/PreparedBlockFragment";
// ------------------------------------------- //

type Props = {
  fragment: PreparedBlockFragment;

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
    fragment,
    onChange,
    onDelete,
    onMoveUp,
    onMoveDown,
    searchTerm,
    setActiveBlockId,
}: Props) {

  const prepared = fragment.prepared;

  const {
      block,
      editorLayout,
  } = prepared;

  const fragmentLines =
    prepared.composition.lines.slice(
          fragment.startLine,
          fragment.endLine
      );

  const fragmentText =
      fragmentLines.join("\n");
  
// -------------------------------------------------- //
  return (

    <div
      className={`script-block ${editorLayout.className}`}
      style={{
        width: editorLayout.width,

        marginLeft: editorLayout.marginLeft,

        paddingBottom: editorLayout.marginBottom,

        textAlign: editorLayout.align,

        fontWeight: editorLayout.bold
          ? "bold"
          : "normal",

        fontStyle: editorLayout.italic
          ? "italic"
          : "normal",
      }}
    >

    <div className="block-row">

      <div className="editor-layer">

        <ScriptEditor
            value={fragmentText}
            fragmentText={fragmentText}
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