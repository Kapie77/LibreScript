import { useLayoutEffect, useRef } from "react";
import type { PreparedBlock } from "../../../layout/core/PreparedBlock";
// ------------------------------------------- //

type Props = {
  prepared: PreparedBlock;

  onChange: (id: number, content: string) => void;
  onDelete: (id: number) => void;
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;

  searchTerm: string;
};

export default function ScriptBlock({
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  searchTerm,
  prepared,
}: Props) {

// -------------------------------------------------- //

const {
  block,
  layout,
  contentHeight,
} = prepared;

// log
console.log(
  "EDITOR",
  block.type,
  {
    lines: prepared.composition.lineCount,
    contentHeight: prepared.contentHeight,
    editorHeight: prepared.editorHeight,
    pdfHeight: prepared.pdfHeight,
  }
);

// Medi a altura real do bloco
const blockRef = useRef<HTMLDivElement>(null);

  // useeffect para medit a altura real
  useLayoutEffect(() => {

  if (!textareaRef.current) return;

}, [block.content]);

// Quebra de página
const textareaRef =
  useRef<HTMLTextAreaElement>(null);
  
  //Função para quebra de página
  useLayoutEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "0px";

    textareaRef.current.style.height =
      `${contentHeight}px`;

  }, [block.content]);

// Função de highlight do termo pesquisado
const highlightText = (
  text: string
) => {

  if (!searchTerm.trim()) {
    return text;
  }

  const regex = new RegExp(
    `(${searchTerm})`,
    "gi"
  );

  const parts =
    text.split(regex);

  return parts.map(
    (part, index) =>

      part.toLowerCase() ===
      searchTerm.toLowerCase()

        ? (
          <mark
            key={index}
            className="search-highlight"
          >
            {part}
          </mark>
        )

        : part
  );
};
  
// -------------------------------------------------- //
  return (

    <div
      ref={blockRef}
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

      <textarea
        ref={textareaRef}
        className="script-input"
        value={block.content}
        rows={1}
        onChange={(e)=>
          onChange(block.id,e.target.value)
        }
      />

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