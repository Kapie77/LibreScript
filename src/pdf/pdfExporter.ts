// pdfExporter.ts
// src/pdf/

// pdfExporter = calcula a paginação do PDF.

import { jsPDF } from "jspdf";
import type { ScriptProject } from "../types/project";
import { paginate } from "../layout/engine/Pagination";
import { PAGE_PDF } from "../layout/config/PagePDF";
import { buildPdfPreparedBlocks } from
    "../layout/builders/buildPdfPreparedBlocks";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import type { Settings } from "../types/settings";
// ------------------------------------------------------------ //

export async function exportProjectToPDF(
    project: ScriptProject,
    pageNumberPosition:
        Settings["pageNumberPosition"]
) {

    const doc =
        new jsPDF();

    doc.setFont(
        "courier",
        "normal"
    );

    doc.setFontSize(
        12
    );

    let y = 80;

    // =========================================================
    // PREPARA OS BLOCOS
    // =========================================================

    const preparedBlocks =
        buildPdfPreparedBlocks(
            doc,
            project.blocks
        );

    // =========================================================
    // PAGINAÇÃO
    // =========================================================

    const pages =
        paginate(
            preparedBlocks,
            PAGE_PDF.contentHeight
        );

    // =========================================================
    // CAPA
    // =========================================================

    doc.setFont(
        "courier",
        "bold"
    );

    doc.setFontSize(
        24
    );

    doc.text(
        project.title ||
            "Sem título",
        105,
        y,
        {
            align: "center",
        }
    );

    y += 40;

    doc.setFont(
        "courier",
        "normal"
    );

    doc.setFontSize(
        14
    );

    doc.text(
        "Escrito por",
        105,
        y,
        {
            align: "center",
        }
    );

    y += 20;

    doc.setFont(
        "courier",
        "bold"
    );

    doc.text(
        project.author ||
            "Desconhecido",
        105,
        y,
        {
            align: "center",
        }
    );

    // =========================================================
    // PRIMEIRA PÁGINA DE CONTEÚDO
    // =========================================================

    doc.addPage();

    doc.setFontSize(
        12
    );

    // =========================================================
    // CONTEÚDO
    // =========================================================

    pages.forEach(
        (
            pageFragments,
            pageIndex
        ) => {

            if (
                pageIndex > 0
            ) {

                doc.addPage();

            }

            y = PAGE_PDF.paddingTop + 4;

            pageFragments.forEach(
                (
                    fragment
                ) => {

                    const prepared =
                        fragment.prepared;

                    const pdfLayout =
                        prepared.pdfLayout;

                    const lines =
                        prepared.composition.lines.slice(
                            fragment.startLine,
                            fragment.endLine
                        );

                    // -----------------------------------------
                    // CONFIGURAÇÃO DA FONTE
                    // -----------------------------------------

                    doc.setFont(
                        "courier",
                        pdfLayout.fontStyle
                    );

                    doc.setFontSize(
                        12
                    );

                    // -----------------------------------------
                    // TEXTO
                    // -----------------------------------------

                    if (
                        pdfLayout.align ===
                        "right"
                    ) {

                        doc.text(
                            lines,
                            pdfLayout.x,
                            y,
                            {
                                align:
                                    "right",
                            }
                        );

                    } else {

                        doc.text(
                            lines,
                            pdfLayout.x,
                            y
                        );

                    }

                    // -----------------------------------------
                    // ALTURA DO FRAGMENTO
                    // -----------------------------------------

                    y +=
                        fragment.contentHeight;

                }
            );

        }
    );

    // =========================================================
    // NUMERAÇÃO
    // =========================================================

    if (
        pageNumberPosition !== "none"
    ) {

        const totalPages =
            doc.getNumberOfPages();

        for (
            let page = 2;
            page <= totalPages;
            page++
        ) {

            doc.setPage(
                page
            );

            doc.setFont(
                "courier",
                "normal"
            );

            doc.setFontSize(
                10
            );

            const pageNumber =
                String(
                    page - 1
                );

            switch (
                pageNumberPosition
            ) {

                case "top-right":

                    doc.text(
                        pageNumber,
                        190,
                        10
                    );

                    break;

                case "top-left":

                    doc.text(
                        pageNumber,
                        20,
                        10
                    );

                    break;

                case "bottom-right":

                    doc.text(
                        pageNumber,
                        190,
                        287
                    );

                    break;

                case "bottom-left":

                    doc.text(
                        pageNumber,
                        20,
                        287
                    );

                    break;

            }

        }

    }

    // =========================================================
    // SALVA
    // =========================================================

    const fileName =
        project.title.trim() || "Roteiro";

    const filePath =
        await save({
            defaultPath: `${fileName}.pdf`,

            filters: [
                {
                    name: "PDF",
                    extensions: ["pdf"],
                },
            ],
        });

    if (!filePath) {

        return;

    }

    const pdfArrayBuffer =
        doc.output("arraybuffer");

    const pdfBytes =
        new Uint8Array(
            pdfArrayBuffer
        );

    await writeFile(
        filePath,
        pdfBytes
    );

}