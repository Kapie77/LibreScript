import type { ScriptBlock as ScriptBlockType } from "../types/script";
import { useLayoutEffect, useRef } from "react";
// ------------------------------------------- //
type Props = {
  block: ScriptBlockType;
  onChange: (id: number, content: string) => void;
  onDelete: (id: number) => void;
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;

  searchTerm: string;
};

export default function ScriptBlock({
  block,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  searchTerm,
}: Props) {

// -------------------------------------------------- //

// Quebra de página
const textareaRef =
  useRef<HTMLTextAreaElement>(null);
  //Função para quebra de página
  useLayoutEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height =
      textareaRef.current.scrollHeight + "px";

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

    <div className={`script-block ${block.type}`}>

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