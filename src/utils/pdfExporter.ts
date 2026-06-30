// pdfExporter = calcula a paginação do PDF.

import { jsPDF } from "jspdf";
import type { ScriptProject } from "../types/project";
import { paginate } from "../layout/Pagination";
import type { MeasurementMap } from "../layout/types";
import { getBlockLayout } from "../layout/ScriptBlockLayout";
import { measureBlock } from "../layout/LayoutEngine";
import { PAGE_PDF } from "../layout/PagePDF";
// ------------------------------------------------------------ //

export function exportProjectToPDF(
  project: ScriptProject
) {

  const doc = new jsPDF();

  let y = 80;

  // ============================================
  // Mede todos os blocos usando o LayoutEngine
  // ============================================
  const measurements: MeasurementMap = {};

  const layoutResults = new Map<number, ReturnType<typeof measureBlock>>();

  project.blocks.forEach((block) => {

    const layout =
      getBlockLayout(block);

    const result =
      measureBlock(block);

    layoutResults.set(
      block.id,
      result
    );

    const pdfHeight =
      result.lineCount *
      layout.pdf.lineHeight +
      layout.pdf.marginBottom;

    measurements[block.id] = pdfHeight;

  });
  
  // ===========================
  // Paginação
  // ===========================
  const pages =
    paginate(
      project.blocks,
      measurements,
      PAGE_PDF.contentHeight
    );

  // ===========================
  // CAPA
  // ===========================
  doc.setFont("courier", "bold");
  doc.setFontSize(24);

  doc.text(
    project.title || "Sem título",
    105,
    y,
    {
      align: "center",
    }
  );

  y += 40;

  doc.setFont("courier", "normal");
  doc.setFontSize(14);

  doc.text(
    "Escrito por",
    105,
    y,
    {
      align: "center",
    }
  );

  y += 20;

  doc.setFont("courier", "bold");

  doc.text(
    project.author || "Desconhecido",
    105,
    y,
    {
      align: "center",
    }
  );

  // ===========================
  // Primeira página
  // ===========================

  doc.addPage();

  doc.setFontSize(12);

  // ===========================
  // Conteúdo
  // ===========================

  pages.forEach((pageBlocks, pageIndex) => {

    if (pageIndex > 0) {
      doc.addPage();
    }

    y = 20;

    pageBlocks.forEach((block) => {

      const layout =
        getBlockLayout(block);

      const result =
        layoutResults.get(block.id)!;

      doc.setFont(
        "courier",
        layout.pdf.fontStyle
      );

      if (layout.pdf.align === "right") {

        doc.text(
          result.lines[0],
          layout.pdf.x,
          y,
          {
            align: "right",
          }
        );

      } else {

        doc.text(
          result.lines,
          layout.pdf.x,
          y
        );

      }

      // Calcula a altura do PDF:
      const pdfHeight =
        result.lineCount *
        layout.pdf.lineHeight +
        layout.pdf.marginBottom;

      y += pdfHeight;
      // esse valor serve para:
      // montar a paginação do PDF;
      // incrementar o y.

    });

  });

  // ===========================
  // Numeração
  // ===========================
  const totalPages =
    doc.getNumberOfPages();

  for (
    let page = 2;
    page <= totalPages;
    page++
  ) {

    doc.setPage(page);

    doc.setFont(
      "courier",
      "normal"
    );

    doc.setFontSize(10);

    doc.text(
      String(page - 1),
      190,
      10
    );

  }

  const fileName =
    project.title.trim() || "Roteiro";

  doc.save(
    `${fileName}.pdf`
  );

}