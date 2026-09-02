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
    // PÁGINA DE TÍTULO
    // =========================================================

    if (
        project.titlePage.enabled
    ) {

        let titleY = 65;

        // -----------------------------------------------------
        // TÍTULO
        // -----------------------------------------------------

        doc.setFont(
            "courier",
            "bold"
        );

        doc.setFontSize(
            24
        );

        doc.text(
            (
                project.titlePage.title ||
                "Sem título"
            ).toUpperCase(),
            105,
            titleY,
            {
                align: "center",
            }
        );

        // -----------------------------------------------------
        // SUBTÍTULO
        // -----------------------------------------------------

        if (
            project.titlePage.subtitle?.trim()
        ) {

            titleY += 12;

            doc.setFont(
                "courier",
                "normal"
            );

            doc.setFontSize(
                18
            );

            doc.text(
                project.titlePage.subtitle,
                105,
                titleY,
                {
                    align: "center",
                }
            );

        }

        // -----------------------------------------------------
        // CRÉDITO PRINCIPAL
        // -----------------------------------------------------

        const primaryCredit =
            project.titlePage.primaryCredit;

        if (
            primaryCredit.name?.trim()
        ) {

            titleY += 35;

            doc.setFont(
                "courier",
                "normal"
            );

            doc.setFontSize(
                14
            );

            const creditLabel =
                primaryCredit.type ===
                "screenplay-by"
                    ? "Screenplay by"
                    : "Written by";

            doc.text(
                creditLabel,
                105,
                titleY,
                {
                    align: "center",
                }
            );

            // -------------------------------------------------
            // NOME
            // -------------------------------------------------

            titleY += 10;

            doc.setFont(
                "courier",
                "bold"
            );

            doc.setFontSize(
                14
            );

            doc.text(
                primaryCredit.name,
                105,
                titleY,
                {
                    align: "center",
                }
            );

        }

        // -----------------------------------------------------
        // STORY BY
        // -----------------------------------------------------

        if (
            project.titlePage.storyBy?.trim()
        ) {

            titleY += 25;

            doc.setFont(
                "courier",
                "normal"
            );

            doc.setFontSize(
                14
            );

            doc.text(
                "Story by",
                105,
                titleY,
                {
                    align: "center",
                }
            );

            titleY += 10;

            doc.setFont(
                "courier",
                "bold"
            );

            doc.text(
                project.titlePage.storyBy,
                105,
                titleY,
                {
                    align: "center",
                }
            );

        }

        // -----------------------------------------------------
        // BASED ON
        // -----------------------------------------------------

        if (
            project.titlePage.basedOn?.trim()
        ) {

            titleY += 25;

            doc.setFont(
                "courier",
                "normal"
            );

            doc.setFontSize(
                14
            );

            doc.text(
                `Based on ${project.titlePage.basedOn}`,
                105,
                titleY,
                {
                    align: "center",
                }
            );

            // -------------------------------------------------
            // AUTOR DA OBRA ORIGINAL
            // -------------------------------------------------

            if (
                project.titlePage.basedOnBy?.trim()
            ) {

                titleY += 5;

                doc.text(
                    `by ${project.titlePage.basedOnBy}`,
                    105,
                    titleY,
                    {
                        align: "center",
                    }
                );

            }

        }

        // -----------------------------------------------------
        // DRAFT
        // -----------------------------------------------------

        if (project.titlePage.draft?.trim()) {

            let draftX = 105;
            let draftY = 245;
            let draftAlign: "left" | "center" | "right" = "center";

            switch (project.titlePage.draftPosition) {

                case "left":

                    draftX = 20;
                    draftY = 235;
                    draftAlign = "left";

                    break;

                case "right":

                    draftX = 190;
                    draftY = 250;
                    draftAlign = "right";

                    break;

                case "center":
                default:

                    draftX = 105;
                    draftY = 230;
                    draftAlign = "center";

                    break;
            }

            doc.setFont(
                "courier",
                "normal"
            );

            doc.setFontSize(
                14
            );

            doc.text(
                project.titlePage.draft,
                draftX,
                draftY,
                {
                    align: draftAlign,
                }
            );
        }

        // -----------------------------------------------------
        // DATA
        // -----------------------------------------------------

        if (project.titlePage.date?.trim()) {

            let dateX = 105;
            let dateY = 260;
            let dateAlign: "left" | "center" | "right" = "center";

            switch (project.titlePage.datePosition) {

                case "left":

                    dateX = 20;
                    dateY = 243;
                    dateAlign = "left";

                    break;

                case "right":

                    dateX = 190;
                    dateY = 257;
                    dateAlign = "right";

                    break;

                case "center":
                default:

                    dateX = 105;
                    dateY = 238;
                    dateAlign = "center";

                    break;
            }

            doc.setFont(
                "courier",
                "normal"
            );

            doc.setFontSize(
                14
            );

            doc.text(
                project.titlePage.date,
                dateX,
                dateY,
                {
                    align: dateAlign,
                }
            );
        }

        // -----------------------------------------------------
        // CONTATO
        // -----------------------------------------------------

        const contact =
            project.titlePage.contact;

        if (
            contact.address?.trim() ||
            contact.phone?.trim() ||
            contact.email?.trim()
        ) {

            let contactY =
                250;

            doc.setFont(
                "courier",
                "normal"
            );

            doc.setFontSize(
                10
            );

            if (
                contact.address?.trim()
            ) {

                doc.text(
                    contact.address,
                    20,
                    contactY
                );

                contactY += 5;

            }

            if (
                contact.phone?.trim()
            ) {

                doc.text(
                    contact.phone,
                    20,
                    contactY
                );

                contactY += 5;

            }

            if (
                contact.email?.trim()
            ) {

                doc.text(
                    contact.email,
                    20,
                    contactY
                );

            }

        }

        // -----------------------------------------------------
        // COPYRIGHT
        // -----------------------------------------------------

        if (project.titlePage.copyright?.trim()) {

            doc.setFont(
                "courier",
                "normal"
            );

            doc.setFontSize(
                10
            );

            const copyrightLines =
                doc.splitTextToSize(
                    project.titlePage.copyright,
                    150
                );

            const copyrightLineHeight =
                4;

            const copyrightBottom =
                8;

            const copyrightY =
                297 -
                copyrightBottom -
                (
                    (copyrightLines.length - 1) *
                    copyrightLineHeight
                );

            doc.text(
                copyrightLines,
                105,
                copyrightY,
                {
                    align: "center",
                    lineHeightFactor: 1.0,
                }
            );
        }

        // =====================================================
        // PRIMEIRA PÁGINA DO ROTEIRO
        // =====================================================

        doc.addPage();

    }

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

        const firstNumberedPage =
            project.titlePage.enabled
                ? 2
                : 1;

        for (
            let page = firstNumberedPage;
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
                    project.titlePage.enabled
                        ? page - 1
                        : page
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