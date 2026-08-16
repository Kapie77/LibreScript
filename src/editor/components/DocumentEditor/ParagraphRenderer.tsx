// ParagraphRenderer.tsx
// src/editor/components/DocumentEditor/

/*
===========================================================
ParagraphRenderer.tsx

Responsável por renderizar um único ScriptBlock no editor.

O componente obtém a aparência visual através de
getEditorBlockLayout().

Ele NÃO define:

- largura;
- margens;
- posicionamento;
- alinhamento;
- negrito;
- itálico;
- caixa alta;
- espaçamento vertical;
- conteúdo padrão.

Essas regras pertencem ao BlockLayout.ts.

A lógica de edição, cursor, seleção, teclado e comandos
pertence ao EditorEngine e seus respectivos controllers.

===========================================================
*/

import type { ScriptBlock } from "../../../types/script";
import { getEditorBlockLayout } from "../../../layout";

import {
    useEffect,
    useRef,
} from "react";

import { EditorEngine } from "../../../editor/engine/EditorEngine";

// -------------------------------------------------------------------- //

type Props = {

    block: ScriptBlock;

    engine: EditorEngine;

    onChange: (
        id: number,
        content: string
    ) => void;

};

// -------------------------------------------------------------------- //

export default function ParagraphRenderer({

    block,

}: Props) {

    // ---------------------------------------------------------------
    // REFERÊNCIA DO ELEMENTO
    // ---------------------------------------------------------------

    const editorRef =
        useRef<HTMLParagraphElement>(null);

    // ---------------------------------------------------------------
    // LAYOUT
    // ---------------------------------------------------------------

    const layout =
        getEditorBlockLayout(block.type);

    // ---------------------------------------------------------------
    // SINCRONIZAÇÃO DO CONTEÚDO
    // ---------------------------------------------------------------

    useEffect(() => {

        const editor =
            editorRef.current;

        if (!editor) return;

        /*
        Não substituímos o conteúdo enquanto este
        elemento estiver recebendo edição direta.
        */

        if (
            document.activeElement === editor
        ) {

            return;

        }

        if (
            editor.textContent !== block.content
        ) {

            editor.textContent =
                block.content;

        }

    }, [block.content]);

    // ---------------------------------------------------------------
    // RENDER
    // ---------------------------------------------------------------

    return (

        <p
            ref={editorRef}

            contentEditable

            tabIndex={0}

            suppressContentEditableWarning

            className={layout.className}

            style={{

                width:
                    layout.width,

                maxWidth:
                    layout.maxWidth,

                marginLeft:
                    layout.marginLeft,

                marginTop:
                    layout.marginTop,

                marginBottom:
                    layout.marginBottom,

                lineHeight:
                    `${layout.lineHeight}px`,

                textAlign:
                    layout.align,

                fontWeight:
                    layout.bold
                        ? "bold"
                        : "normal",

                fontStyle:
                    layout.italic
                        ? "italic"
                        : "normal",

                whiteSpace:
                    "pre-wrap",

            }}

        />

    );

}