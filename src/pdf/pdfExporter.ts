// pdfExporter = calcula a paginação do PDF.

import { jsPDF } from "jspdf";
import type { ScriptProject } from "../types/project";
import { paginate } from "../layout/engine/Pagination";
import { PAGE_PDF } from "../layout/config/PagePDF";
import { buildPdfPreparedBlocks } from "../layout/builders/buildPdfPreparedBlocks";

// ------------------------------------------------------------ //

export function exportProjectToPDF(
  project: ScriptProject
) {

  const doc = new jsPDF();

  let y = 80;

  // PreparedBlocks
  const preparedBlocks =
    buildPdfPreparedBlocks(
        doc,
        project.blocks
    );

  
  // ===========================
  // Paginação
  // ===========================
  const pages =
    paginate(
        preparedBlocks,
        PAGE_PDF.contentHeight,
        block => block.pdfHeight
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

    pageBlocks.forEach((prepared) => {

      const {
          block,
          layout,
          composition,
          pdfHeight,
      } = prepared;

      doc.setFont(
        "courier",
        layout.pdf.fontStyle
      );

      if (layout.pdf.align === "right") {

        doc.text(
          composition.lines,
          layout.pdf.x,
          y,
          {
            align: "right",
          }
        );

      } else {

        doc.text(
          composition.lines,
          layout.pdf.x,
          y
        );

      }

      console.log({
          pdf: pdfHeight,
          tipo: block.type,
      });

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