// PreparedBlock.ts
// src/layout/core/

/*
===========================================================
Representa um ScriptBlock que já foi preparado para os
motores de composição, editor e PDF.

Ele reúne:

- o bloco original;
- o layout específico do Editor;
- o layout específico do PDF;
- o resultado da composição do texto;
- as alturas calculadas.

Este arquivo NÃO calcula nada.

Ele apenas define a estrutura dos dados preparados.

A separação entre EditorBlockLayout e PdfBlockLayout
é intencional: o Editor e o PDF possuem sistemas de
medidas e apresentação independentes.

===========================================================
*/

import type { ScriptBlock } from "../../types/script";
import type { EditorBlockLayout } from "../BlockLayout";
import type { PdfBlockLayout } from "../pdf/PdfLayout";
import type { CompositionResult } from "../engine/CompositionEngine";
// ------------------------------------------------------------ //

export interface PreparedBlock {
    block: ScriptBlock;
    editorLayout: EditorBlockLayout;
    pdfLayout: PdfBlockLayout;
    composition: CompositionResult;
    contentHeight: number;
    editorHeight: number;
    pdfHeight: number;
}