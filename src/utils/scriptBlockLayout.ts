import { jsPDF } from "jspdf";
import type { ScriptProject } from "../types/project";
import { paginate } from "../layout/Pagination";
import type { MeasurementMap } from "../layout/types";
import { getPdfBlockData } from "./pdfBlockRenderer";
// ------------------------------------------------------------ //

export function exportProjectToPDF(
  project: ScriptProject
) {

  const doc = new jsPDF();

  doc.setFont("courier", "normal");

  let y = 80;

  // ===========================
  // Mede todos os blocos
  // ===========================
  doc.setFont("courier", "normal");
  doc.setFontSize(12);

  const measurements: MeasurementMap = {};

    project.blocks.forEach((block) => {

      const pdf =
        getPdfBlockData(block);

      const lines =
        doc.splitTextToSize(
          pdf.content,
          pdf.maxWidth
        );

      measurements[block.id] =
        lines.length * 6 + 4;

    });

  // Cria as páginas usando o novo sistema

  const pages =
    paginate(
      project.blocks,
      measurements
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
    { align: "center" }
  );

  y += 40;

  doc.setFont("courier", "normal");
  doc.setFontSize(14);

  doc.text(
    "Escrito por",
    105,
    y,
    { align: "center" }
  );

  y += 20;

  doc.setFont("courier", "bold");

  doc.text(
    project.author || "Desconhecido",
    105,
    y,
    { align: "center" }
  );

  // Primeira página do roteiro

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

      const pdf =
        getPdfBlockData(block);

      const lines =
        doc.splitTextToSize(
          pdf.content,
          pdf.maxWidth
        );

      const height =
        lines.length * 6 + 4;

      doc.setFont(
        "courier",
        pdf.fontStyle
      );

      if (pdf.isTransition) {

        doc.text(

          pdf.content,

          190,

          y,

          {
            align: "right"
          }

        );

      }

      else {

        doc.text(

          lines,

          pdf.x,

          y

        );

      }

      y += height;

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

    doc.setFont("courier", "normal");
    doc.setFontSize(10);

    doc.text(
      String(page - 1),
      190,
      10
    );

  }

  const fileName =
    project.title.trim() || "Roteiro";

  doc.save(`${fileName}.pdf`);

}