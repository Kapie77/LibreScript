// odtExporter.ts
// src/odt/

// Exportador OpenDocument Text (.odt)
// Independente do exportador PDF.

// O ODT é gerado como um pacote ZIP contendo:
//   mimetype
//   content.xml
//   styles.xml
//   meta.xml
//   settings.xml
//   META-INF/manifest.xml
//   Pictures/*

// O LibreOffice Writer pode abrir o arquivo diretamente.

import JSZip from "jszip";

import type {
    ScriptBlock,
    BlockType,
    ParagraphAlignment,
} from "../types/script";

import type {
    ScriptProject,
} from "../types/project";

import type {
    TextRun,
} from "../editor/document/TextRun";

import {
    save,
} from "@tauri-apps/plugin-dialog";

import {
    readFile,
    writeFile,
} from "@tauri-apps/plugin-fs";

// ============================================================
// CONSTANTES
// ============================================================
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;

const PAGE_LEFT = 20;
const PAGE_RIGHT = 20;

const CONTENT_WIDTH =
    PAGE_WIDTH -
    PAGE_LEFT -
    PAGE_RIGHT;

// ============================================================
// SCREENPLAY GEOMETRY
// ============================================================

const EDITOR_CONTENT_WIDTH = 730;

const ODT_PX_TO_MM =
    CONTENT_WIDTH /
    EDITOR_CONTENT_WIDTH;

// Horizontal layout
const SCENE_MARGIN_LEFT =
    53 * ODT_PX_TO_MM;

const SCENE_MARGIN_RIGHT =
    53 * ODT_PX_TO_MM;

const CHARACTER_MARGIN_LEFT =
    273 * ODT_PX_TO_MM;

const CHARACTER_MARGIN_RIGHT =
    241 * ODT_PX_TO_MM;

const PARENTHETICAL_MARGIN_LEFT =
    288 * ODT_PX_TO_MM;

const PARENTHETICAL_MARGIN_RIGHT =
    226 * ODT_PX_TO_MM;

const DIALOGUE_MARGIN_LEFT =
    198 * ODT_PX_TO_MM;

const DIALOGUE_MARGIN_RIGHT =
    196 * ODT_PX_TO_MM;

// Vertical layout
const LINE_HEIGHT =
    22 * ODT_PX_TO_MM;

const BLOCK_MARGIN_BOTTOM =
    18 * ODT_PX_TO_MM;

const CHARACTER_MARGIN_TOP =
    8 * ODT_PX_TO_MM;

const CHARACTER_MARGIN_BOTTOM =
    2 * ODT_PX_TO_MM;

const PARENTHETICAL_MARGIN_BOTTOM =
    2 * ODT_PX_TO_MM;

const DIALOGUE_MARGIN_BOTTOM =
    18 * ODT_PX_TO_MM;

type OdtPageNumberPosition =
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "none";
// ============================================================
// XML
// ============================================================

function escapeXml(
    value: string
): string {

    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

}

// ============================================================
// TEXT
// ============================================================

function escapeXmlText(
    value: string
): string {

    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n");

}

// ============================================================
// RUN STYLE
// ============================================================

function getRunStyle(
    run: TextRun
): string {

    const bold =
        run.bold === true;

    const italic =
        run.italic === true;

    const underline =
        run.underline === true;

    const strike =
        run.strike === true;

    if (
        bold &&
        italic &&
        underline &&
        strike
    ) {
        return "RunBoldItalicUnderlineStrike";
    }

    if (
        bold &&
        italic &&
        underline
    ) {
        return "RunBoldItalicUnderline";
    }

    if (
        bold &&
        italic &&
        strike
    ) {
        return "RunBoldItalicStrike";
    }

    if (
        bold &&
        underline &&
        strike
    ) {
        return "RunBoldUnderlineStrike";
    }

    if (
        italic &&
        underline &&
        strike
    ) {
        return "RunItalicUnderlineStrike";
    }

    if (
        bold &&
        italic
    ) {
        return "RunBoldItalic";
    }

    if (
        bold &&
        underline
    ) {
        return "RunBoldUnderline";
    }

    if (
        bold &&
        strike
    ) {
        return "RunBoldStrike";
    }

    if (
        italic &&
        underline
    ) {
        return "RunItalicUnderline";
    }

    if (
        italic &&
        strike
    ) {
        return "RunItalicStrike";
    }

    if (
        underline &&
        strike
    ) {
        return "RunUnderlineStrike";
    }

    if (bold) {
        return "RunBold";
    }

    if (italic) {
        return "RunItalic";
    }

    if (underline) {
        return "RunUnderline";
    }

    if (strike) {
        return "RunStrike";
    }

    return "RunNormal";

}

// ============================================================
// BLOCK STYLE
// ============================================================

interface OdtBlockStyle {

    name: string;

    align:
        | "left"
        | "center"
        | "right"
        | "justify";

    marginLeft: number;

    marginRight: number;

    marginTop: number;

    marginBottom: number;

}

// ============================================================
// BLOCK LAYOUT
// ============================================================
function getOdtBlockStyle(
    type: BlockType
): OdtBlockStyle {

    switch (type) {

        // ----------------------------------------------------
        // SCENE
        // ----------------------------------------------------

        case "scene":

            return {
                name: "Scene",
                align: "left",

                marginLeft:
                    SCENE_MARGIN_LEFT,

                marginRight:
                    SCENE_MARGIN_RIGHT,

                marginTop: 0,

                marginBottom:
                    BLOCK_MARGIN_BOTTOM,
            };

        // ----------------------------------------------------
        // ACTION
        // ----------------------------------------------------

        case "action":

            return {
                name: "Action",
                align: "left",

                marginLeft:
                    SCENE_MARGIN_LEFT,

                marginRight:
                    SCENE_MARGIN_RIGHT,

                marginTop: 0,

                marginBottom:
                    BLOCK_MARGIN_BOTTOM,
            };

        // ----------------------------------------------------
        // CHARACTER
        // ----------------------------------------------------

        case "character":
        case "character_contd":
        case "character_os":
        case "character_vo":

            return {
                name: "Character",
                align: "left",

                marginLeft:
                    CHARACTER_MARGIN_LEFT,

                marginRight:
                    CHARACTER_MARGIN_RIGHT,

                marginTop:
                    CHARACTER_MARGIN_TOP,

                marginBottom:
                    CHARACTER_MARGIN_BOTTOM,
            };

        // ----------------------------------------------------
        // PARENTHETICAL
        // ----------------------------------------------------

        case "parenthetical":

            return {
                name: "Parenthetical",
                align: "left",

                marginLeft:
                    PARENTHETICAL_MARGIN_LEFT,

                marginRight:
                    PARENTHETICAL_MARGIN_RIGHT,

                marginTop: 0,

                marginBottom:
                    PARENTHETICAL_MARGIN_BOTTOM,
            };

        // ----------------------------------------------------
        // DIALOGUE
        // ----------------------------------------------------

        case "dialogue":

            return {
                name: "Dialogue",
                align: "left",

                marginLeft:
                    DIALOGUE_MARGIN_LEFT,

                marginRight:
                    DIALOGUE_MARGIN_RIGHT,

                marginTop: 0,

                marginBottom:
                    DIALOGUE_MARGIN_BOTTOM,
            };

        // ----------------------------------------------------
        // SHOT
        // ----------------------------------------------------

        case "shot":
        case "close_up":
        case "wide_shot":
        case "pov":
        case "over_the_shoulder":

            return {
                name: "Shot",
                align: "left",

                marginLeft:
                    SCENE_MARGIN_LEFT,

                marginRight:
                    SCENE_MARGIN_RIGHT,

                marginTop: 0,

                marginBottom:
                    BLOCK_MARGIN_BOTTOM,
            };

        // ----------------------------------------------------
        // TRANSITION
        // ----------------------------------------------------

        case "transition":
        case "cut_to":
        case "fade_out":
        case "fade_in":
        case "dissolve_to":
        case "smash_cut_to":

            return {
                name: "Transition",
                align: "right",

                marginLeft:
                    SCENE_MARGIN_LEFT,

                marginRight:
                    SCENE_MARGIN_RIGHT,

                marginTop: 0,

                marginBottom:
                    BLOCK_MARGIN_BOTTOM,
            };

        // ----------------------------------------------------
        // DEFAULT
        // ----------------------------------------------------

        default:

            return {
                name: "Normal",
                align: "left",

                marginLeft:
                    SCENE_MARGIN_LEFT,

                marginRight:
                    SCENE_MARGIN_RIGHT,

                marginTop: 0,

                marginBottom:
                    BLOCK_MARGIN_BOTTOM,
            };
    }
}

// ============================================================
// ALIGNMENT
// ============================================================

function getAlignment(
    block: ScriptBlock
): ParagraphAlignment {

    if (block.alignment) {

        return block.alignment;

    }

    return getOdtBlockStyle(
        block.type
    ).align;

}

// ============================================================
// RUNS
// ============================================================

function renderRuns(
    block: ScriptBlock
): string {

    // --------------------------------------------------------
    // Documento antigo / sem runs
    // --------------------------------------------------------

    if (
        !block.runs ||
        block.runs.length === 0
    ) {

        return escapeXmlText(
            block.content
        );

    }

    // --------------------------------------------------------
    // Runs
    // --------------------------------------------------------

    return block.runs
        .map(
            (
                run
            ) => {

                if (!run.text) {

                    return "";

                }

                const style =
                    getRunStyle(
                        run
                    );

                return (
                    `<text:span text:style-name="${style}">` +
                    escapeXmlText(
                        run.text
                    ) +
                    `</text:span>`
                );

            }
        )
        .join("");

}

// ============================================================
// BLOCK
// ============================================================
function renderBlock(
    block: ScriptBlock,
    keepWithNext = false
): string {
    const style =
        getOdtBlockStyle(
            block.type
        );

    const styleName =
        keepWithNext
            ? `${style.name}KeepNext`
            : style.name;

    const alignment =
        getAlignment(
            block
        );

    return (
        `<text:p text:style-name="${styleName}" ` +
        `fo:text-align="${alignment}">` +
        renderRuns(block) +
        `</text:p>`
    );
}

// ============================================================
// KEEP TOGETHER
// ============================================================
function isCharacterBlock(
    type: BlockType
): boolean {
    return (
        type === "character" ||
        type === "character_contd" ||
        type === "character_os" ||
        type === "character_vo"
    );
}

function renderBlocks(
    blocks: ScriptBlock[]
): string {
    let result = "";

    for (
        let i = 0;
        i < blocks.length;
        i++
    ) {
        const block =
            blocks[i];

        const nextBlock =
            blocks[i + 1];

        let keepWithNext = false;

        // ----------------------------------------------------
        // CHARACTER
        // ----------------------------------------------------

        if (
            isCharacterBlock(block.type) &&
            nextBlock
        ) {
            keepWithNext =
                nextBlock.type === "dialogue" ||
                nextBlock.type === "parenthetical";
        }

        // ----------------------------------------------------
        // PARENTHETICAL
        // ----------------------------------------------------

        if (
            block.type === "parenthetical" &&
            nextBlock?.type === "dialogue"
        ) {
            keepWithNext = true;
        }

        result +=
            renderBlock(
                block,
                keepWithNext
            );
    }

    return result;
}

// ============================================================
// TITLE PAGE
// ============================================================

interface TitlePageImage {

    path: string;

    name: string;

    mediaType:
        | "image/png"
        | "image/jpeg";

    data: Uint8Array;

}

// ============================================================
// RESOLVE TITLE IMAGE
// ============================================================

function resolveTitlePageImagePath(
    project: ScriptProject,
    projectFilePath: string | null
): string | null {

    const imagePath =
        project.titlePage.imagePath;

    if (
        !imagePath?.trim()
    ) {

        return null;

    }

    // Absoluto Windows
    if (
        /^[A-Za-z]:[\\/]/.test(
            imagePath
        )
    ) {

        return imagePath;

    }

    // Absoluto Unix
    if (
        imagePath.startsWith("/")
    ) {

        return imagePath;

    }

    if (!projectFilePath) {

        return null;

    }

    const normalized =
        projectFilePath.replace(
            /\\/g,
            "/"
        );

    const slash =
        normalized.lastIndexOf(
            "/"
        );

    if (
        slash === -1
    ) {

        return null;

    }

    const directory =
        normalized.substring(
            0,
            slash
        );

    return (
        `${directory}/${imagePath}`
    );

}

// ============================================================
// LOAD TITLE PAGE IMAGE
// ============================================================

async function loadTitlePageImage(
    project: ScriptProject,
    projectFilePath: string | null
): Promise<TitlePageImage | null> {

    const imagePath =
        resolveTitlePageImagePath(
            project,
            projectFilePath
        );

    if (!imagePath) {

        return null;

    }

    try {

        const data =
            await readFile(
                imagePath
            );

        const extension =
            imagePath
                .split(".")
                .pop()
                ?.toLowerCase();

        switch (extension) {

            case "png":

                return {

                    path: imagePath,

                    name: "title-page.png",

                    mediaType:
                        "image/png",

                    data,

                };

            case "jpg":
            case "jpeg":

                return {

                    path: imagePath,

                    name: "title-page.jpg",

                    mediaType:
                        "image/jpeg",

                    data,

                };

            default:

                console.warn(
                    "Imagem da página de título não suportada no ODT:",
                    imagePath
                );

                return null;

        }

    } catch (error) {

        console.error(
            "Não foi possível carregar a imagem da página de título:",
            error
        );

        return null;

    }

}

// ============================================================
// TITLE PAGE CONTENT
// ============================================================

function renderTitlePage(
    project: ScriptProject,
    hasImage: boolean
): string {

    const titlePage =
        project.titlePage;

    let xml = "";

    // --------------------------------------------------------
    // Imagem
    // --------------------------------------------------------

    if (
        titlePage.visualMode === "image" &&
        hasImage
    ) {

        xml +=
            `<text:p text:style-name="TitlePageImage">` +
            `<draw:frame ` +
            `draw:style-name="TitlePageImageFrame" ` +
            `text:anchor-type="as-char" ` +
            `svg:width="150mm" ` +
            `svg:height="60mm">` +
            `<draw:image ` +
            `xlink:href="Pictures/title-page.png" ` +
            `xlink:type="simple" ` +
            `xlink:show="embed" ` +
            `xlink:actuate="onLoad" ` +
            `/>` +
            `</draw:frame>` +
            `</text:p>`;

    } else {

        // ----------------------------------------------------
        // Título
        // ----------------------------------------------------

        xml +=
            `<text:p text:style-name="TitlePageTitle">` +
            escapeXmlText(
                titlePage.title ||
                project.title ||
                "Sem título"
            ).toUpperCase() +
            `</text:p>`;

    }

    // --------------------------------------------------------
    // Episódio
    // --------------------------------------------------------

    if (
        project.format === "series" &&
        (
            project.series.episodeNumber?.trim() ||
            project.series.episodeTitle?.trim()
        )
    ) {

        if (
            project.series.episodeNumber?.trim()
        ) {

            xml +=
                `<text:p text:style-name="TitlePageEpisodeNumber">` +
                `Episode ` +
                escapeXmlText(
                    project.series.episodeNumber
                ) +
                `</text:p>`;

        }

        if (
            project.series.episodeTitle?.trim()
        ) {

            xml +=
                `<text:p text:style-name="TitlePageEpisodeTitle">` +
                escapeXmlText(
                    project.series.episodeTitle
                ) +
                `</text:p>`;

        }

    }

    // --------------------------------------------------------
    // Subtitle
    // --------------------------------------------------------

    if (
        titlePage.subtitle?.trim()
    ) {

        xml +=
            `<text:p text:style-name="TitlePageSubtitle">` +
            escapeXmlText(
                titlePage.subtitle
            ) +
            `</text:p>`;

    }

    // --------------------------------------------------------
    // Crédito principal
    // --------------------------------------------------------

    if (
        titlePage.primaryCredit.name?.trim()
    ) {

        const label =
            titlePage.primaryCredit.type ===
            "screenplay-by"
                ? "Screenplay by"
                : "Written by";

        xml +=
            `<text:p text:style-name="TitlePageCredit">` +
            label +
            `</text:p>`;

        xml +=
            `<text:p text:style-name="TitlePageAuthor">` +
            escapeXmlText(
                titlePage.primaryCredit.name
            ) +
            `</text:p>`;

    }

    // --------------------------------------------------------
    // Story by
    // --------------------------------------------------------

    if (
        titlePage.storyBy?.trim()
    ) {

        xml +=
            `<text:p text:style-name="TitlePageCredit">` +
            `Story by` +
            `</text:p>`;

        xml +=
            `<text:p text:style-name="TitlePageAuthor">` +
            escapeXmlText(
                titlePage.storyBy
            ) +
            `</text:p>`;

    }

    // --------------------------------------------------------
    // Directed by
    // --------------------------------------------------------

    if (
        titlePage.directedBy?.trim()
    ) {

        xml +=
            `<text:p text:style-name="TitlePageCredit">` +
            `Directed by` +
            `</text:p>`;

        xml +=
            `<text:p text:style-name="TitlePageAuthor">` +
            escapeXmlText(
                titlePage.directedBy
            ) +
            `</text:p>`;

    }

    // --------------------------------------------------------
    // Based on
    // --------------------------------------------------------

    if (
        titlePage.basedOn?.trim()
    ) {

        xml +=
            `<text:p text:style-name="TitlePageBasedOn">` +
            `Based on ` +
            escapeXmlText(
                titlePage.basedOn
            ) +
            `</text:p>`;

        if (
            titlePage.basedOnBy?.trim()
        ) {

            xml +=
                `<text:p text:style-name="TitlePageBasedOn">` +
                `by ` +
                escapeXmlText(
                    titlePage.basedOnBy
                ) +
                `</text:p>`;

        }

    }

    return xml;

}

// ============================================================
// TITLE PAGE FOOTER CONTENT
// ============================================================

function renderTitlePageFooter(
    project: ScriptProject
): string {

    let xml = "";

    if (
        project.titlePage.draft?.trim()
    ) {

        xml +=
            `<text:p text:style-name="TitlePageDraft">` +
            escapeXmlText(
                project.titlePage.draft
            ) +
            `</text:p>`;

    }

    if (
        project.titlePage.date?.trim()
    ) {

        xml +=
            `<text:p text:style-name="TitlePageDate">` +
            escapeXmlText(
                project.titlePage.date
            ) +
            `</text:p>`;

    }

    const contact =
        project.titlePage.contact;

    if (
        contact.address?.trim()
    ) {

        xml +=
            `<text:p text:style-name="TitlePageContact">` +
            escapeXmlText(
                contact.address
            ) +
            `</text:p>`;

    }

    if (
        contact.phone?.trim()
    ) {

        xml +=
            `<text:p text:style-name="TitlePageContact">` +
            escapeXmlText(
                contact.phone
            ) +
            `</text:p>`;

    }

    if (
        contact.email?.trim()
    ) {

        xml +=
            `<text:p text:style-name="TitlePageContact">` +
            escapeXmlText(
                contact.email
            ) +
            `</text:p>`;

    }

    if (
        project.titlePage.copyright?.trim()
    ) {

        xml +=
            `<text:p text:style-name="TitlePageCopyright">` +
            escapeXmlText(
                project.titlePage.copyright
            ) +
            `</text:p>`;

    }

    return xml;

}

// ============================================================
// CONTENT XML
// ============================================================

function buildContentXml(
    project: ScriptProject,
    projectFilePath: string | null,
    titleImage: TitlePageImage | null
): string {

    const titlePageEnabled =
        project.titlePage.enabled;

    let body = "";

    // --------------------------------------------------------
    // Página de título
    // --------------------------------------------------------

    if (titlePageEnabled) {

        body +=
            renderTitlePage(
                project,
                titleImage !== null
            );

        body +=
            renderTitlePageFooter(
                project
            );

        // Força início do roteiro na página seguinte.
        body +=
            `<text:p text:style-name="PageBreak"/>`;

    }

    if (!titlePageEnabled) {

        body +=
            `<text:p text:style-name="FirstContentPageMarker">
                <text:s/>
            </text:p>`;
    }

    // --------------------------------------------------------
    // Roteiro
    // --------------------------------------------------------

    body +=
        renderBlocks(
            project.blocks
        );

    return `<?xml version="1.0" encoding="UTF-8"?>

<office:document-content
    xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
    xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
    xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
    xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
    xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:svg="http://www.w3.org/2000/svg"
    xmlns:officeooo="http://openoffice.org/2009/office"
    office:version="1.3">

    <office:scripts/>

    <office:font-face-decls>
        <style:font-face
            style:name="Courier Prime"
            svg:font-family="&quot;Courier Prime&quot;"
        />
    </office:font-face-decls>

    <office:automatic-styles/>

    <office:body>

        <office:text>

            ${body}

        </office:text>

    </office:body>

</office:document-content>`;
}

// ============================================================
// STYLES XML
// ============================================================

function buildStylesXml(
    project: ScriptProject,
    pageNumberPosition: OdtPageNumberPosition
): string {

    const firstPageEnabled =
        project.titlePage.enabled;

    const firstPageStyle =
        firstPageEnabled
            ? "TitlePage"
            : "ContentPage";

    const pageNumberAlignment =
        pageNumberPosition === "top-left" ||
        pageNumberPosition === "bottom-left"
            ? "left"
            : "right";

    const pageNumberIsTop =
        pageNumberPosition === "top-left" ||
        pageNumberPosition === "top-right";

    return `<?xml version="1.0" encoding="UTF-8"?>

<office:document-styles
    xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
    xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
    xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
    xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
    xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
    xmlns:svg="http://www.w3.org/2000/svg"
    office:version="1.3">

    <office:font-face-decls>

        <style:font-face
            style:name="Courier Prime"
            svg:font-family="&quot;Courier Prime&quot;"
        />

    </office:font-face-decls>

    <office:styles>

        <!-- ============================================ -->
        <!-- RUNS -->
        <!-- ============================================ -->

        <style:style
            style:name="RunNormal"
            style:family="text">

            <style:text-properties
                style:font-name="Courier Prime"
                fo:font-family="&quot;Courier Prime&quot;"
                fo:font-size="11pt"
            />

        </style:style>

        <style:style
            style:name="RunBold"
            style:family="text"
            style:parent-style-name="RunNormal">

            <style:text-properties
                fo:font-weight="bold"
            />

        </style:style>

        <style:style
            style:name="RunItalic"
            style:family="text"
            style:parent-style-name="RunNormal">

            <style:text-properties
                fo:font-style="italic"
            />

        </style:style>

        <style:style
            style:name="RunUnderline"
            style:family="text"
            style:parent-style-name="RunNormal">

            <style:text-properties
                style:text-underline-style="solid"
                style:text-underline-width="auto"
            />

        </style:style>

        <style:style
            style:name="RunStrike"
            style:family="text"
            style:parent-style-name="RunNormal">

            <style:text-properties
                style:text-line-through-style="solid"
            />

        </style:style>

        <style:style
            style:name="RunBoldItalic"
            style:family="text"
            style:parent-style-name="RunNormal">

            <style:text-properties
                fo:font-weight="bold"
                fo:font-style="italic"
            />

        </style:style>

        <style:style
            style:name="RunBoldUnderline"
            style:family="text"
            style:parent-style-name="RunNormal">

            <style:text-properties
                fo:font-weight="bold"
                style:text-underline-style="solid"
            />

        </style:style>

        <style:style
            style:name="RunBoldStrike"
            style:family="text"
            style:parent-style-name="RunNormal">

            <style:text-properties
                fo:font-weight="bold"
                style:text-line-through-style="solid"
            />

        </style:style>

        <style:style
            style:name="RunItalicUnderline"
            style:family="text"
            style:parent-style-name="RunNormal">

            <style:text-properties
                fo:font-style="italic"
                style:text-underline-style="solid"
            />

        </style:style>

        <style:style
            style:name="RunItalicStrike"
            style:family="text"
            style:parent-style-name="RunNormal">

            <style:text-properties
                fo:font-style="italic"
                style:text-line-through-style="solid"
            />

        </style:style>

        <style:style
            style:name="RunUnderlineStrike"
            style:family="text"
            style:parent-style-name="RunNormal">

            <style:text-properties
                style:text-underline-style="solid"
                style:text-line-through-style="solid"
            />

        </style:style>

        <style:style
            style:name="RunBoldItalicUnderline"
            style:family="text"
            style:parent-style-name="RunNormal">

            <style:text-properties
                fo:font-weight="bold"
                fo:font-style="italic"
                style:text-underline-style="solid"
            />

        </style:style>

        <style:style
            style:name="RunBoldItalicStrike"
            style:family="text"
            style:parent-style-name="RunNormal">

            <style:text-properties
                fo:font-weight="bold"
                fo:font-style="italic"
                style:text-line-through-style="solid"
            />

        </style:style>

        <style:style
            style:name="RunBoldUnderlineStrike"
            style:family="text"
            style:parent-style-name="RunNormal">

            <style:text-properties
                fo:font-weight="bold"
                style:text-underline-style="solid"
                style:text-line-through-style="solid"
            />

        </style:style>

        <style:style
            style:name="RunItalicUnderlineStrike"
            style:family="text"
            style:parent-style-name="RunNormal">

            <style:text-properties
                fo:font-style="italic"
                style:text-underline-style="solid"
                style:text-line-through-style="solid"
            />

        </style:style>

        <style:style
            style:name="RunBoldItalicUnderlineStrike"
            style:family="text"
            style:parent-style-name="RunNormal">

            <style:text-properties
                fo:font-weight="bold"
                fo:font-style="italic"
                style:text-underline-style="solid"
                style:text-line-through-style="solid"
            />

        </style:style>

        <!-- ============================================ -->
        <!-- SCREENPLAY PARAGRAPHS -->
        <!-- ============================================ -->

        <style:style
            style:name="Normal"
            style:family="paragraph">

            <style:paragraph-properties
                fo:margin-left="12.33mm"
                fo:margin-right="12.33mm"
                fo:margin-top="0mm"
                fo:margin-bottom="4.19mm"
                fo:line-height="5.82mm"
                fo:orphans="1"
                fo:widows="1"
            />

            <style:text-properties
                style:font-name="Courier Prime"
                fo:font-family="&quot;Courier Prime&quot;"
                fo:font-size="11pt"
            />

        </style:style>

        <style:style
            style:name="Scene"
            style:family="paragraph"
            style:parent-style-name="Normal">

            <style:text-properties
                fo:font-weight="bold"
            />

        </style:style>

        <style:style
            style:name="Action"
            style:family="paragraph"
            style:parent-style-name="Normal">

            <style:text-properties
                fo:font-weight="normal"
            />

        </style:style>

        <style:style
            style:name="Character"
            style:family="paragraph"
            style:parent-style-name="Normal">

            <style:paragraph-properties
                fo:margin-left="68.15mm"
                fo:margin-right="51.46mm"
                fo:margin-top="1.86mm"
                fo:margin-bottom="0.47mm"
                fo:text-align="center"
            />

            <style:text-properties
                fo:font-weight="bold"
            />

        </style:style>

        <style:style
            style:name="CharacterKeepNext"
            style:family="paragraph"
            style:parent-style-name="Character">

            <style:paragraph-properties
                fo:keep-with-next="always"
            />

        </style:style>

        <style:style
            style:name="Parenthetical"
            style:family="paragraph"
            style:parent-style-name="Normal">

            <style:paragraph-properties
                fo:margin-left="68.15mm"
                fo:margin-right="51.46mm"
                fo:margin-top="0mm"
                fo:margin-bottom="0.47mm"
                fo:text-align="left"
            />

            <style:text-properties
                fo:font-style="italic"
            />

        </style:style>

        <style:style
            style:name="ParentheticalKeepNext"
            style:family="paragraph"
            style:parent-style-name="Parenthetical">

            <style:paragraph-properties
                fo:keep-with-next="always"
            />

        </style:style>

        <style:style
            style:name="Dialogue"
            style:family="paragraph"
            style:parent-style-name="Normal">

            <style:paragraph-properties
                fo:margin-left="46.03mm"
                fo:margin-right="45.67mm"
                fo:margin-top="0mm"
                fo:margin-bottom="4.19mm"
            />

        </style:style>

        <style:style
            style:name="Shot"
            style:family="paragraph"
            style:parent-style-name="Normal">

            <style:text-properties
                fo:font-weight="bold"
            />

        </style:style>

        <style:style
            style:name="Transition"
            style:family="paragraph"
            style:parent-style-name="Normal">

            <style:paragraph-properties
                fo:text-align="right"
            />

            <style:text-properties
                fo:font-weight="bold"
            />

        </style:style>

        <style:style style:name="PageNumber" style:family="paragraph">
            <style:paragraph-properties
                fo:text-align="${pageNumberAlignment}"
                fo:margin-top="0mm"
                fo:margin-bottom="0mm"
            />
            <style:text-properties
                style:font-name="Courier New"
                fo:font-family="&quot;Courier New&quot;"
                fo:font-size="10pt"
            />
        </style:style>

        <style:style
            style:name="FirstContentPageMarker"
            style:family="paragraph"
            style:master-page-name="FirstContentPage">

            <style:paragraph-properties
                fo:margin-top="0mm"
                fo:margin-bottom="0mm"
                fo:line-height="0mm"
            />

            <style:text-properties
                fo:font-size="1pt"
            />

        </style:style>

        <style:page-layout style:name="FirstContentPageLayout">
            <style:page-layout-properties
                fo:page-width="210mm"
                fo:page-height="297mm"
                fo:margin-left="20mm"
                fo:margin-right="20mm"
                fo:margin-top="15.88mm"
                fo:margin-bottom="21.17mm"
                style:first-page-number="1"
            />
        </style:page-layout>

        <!-- ============================================ -->
        <!-- PAGE BREAK -->
        <!-- ============================================ -->

        <style:style
            style:name="PageBreak"
            style:family="paragraph"
            style:master-page-name="FirstContentPage">

            <style:paragraph-properties
                fo:break-before="page"
                style:master-page-name="FirstContentPage"
                style:page-number="1"
            />

        </style:style>

        <!-- ============================================ -->
        <!-- TITLE PAGE -->
        <!-- ============================================ -->

        <style:style
            style:name="TitlePageContainer"
            style:family="paragraph">

            <style:paragraph-properties
                fo:text-align="center"
            />

        </style:style>

        <style:style
            style:name="TitlePageTitle"
            style:family="paragraph"
            style:master-page-name="TitlePage">

            <style:paragraph-properties
                fo:text-align="center"
                fo:margin-top="60mm"
                fo:margin-bottom="0mm"
            />

            <style:text-properties
                style:font-name="Courier New"
                fo:font-family="&quot;Courier New&quot;"
                fo:font-size="24pt"
                fo:font-weight="bold"
            />

        </style:style>

        <style:style
            style:name="TitlePageImage"
            style:family="paragraph"
            style:master-page-name="TitlePage">

            <style:paragraph-properties
                fo:text-align="center"
                fo:margin-top="45mm"
            />

        </style:style>

        <style:style
            style:name="TitlePageEpisodeNumber"
            style:family="paragraph">

            <style:paragraph-properties
                fo:text-align="center"
                fo:margin-top="8mm"
            />

            <style:text-properties
                fo:font-size="16pt"
            />

        </style:style>

        <style:style
            style:name="TitlePageEpisodeTitle"
            style:family="paragraph">

            <style:paragraph-properties
                fo:text-align="center"
                fo:margin-top="2mm"
            />

            <style:text-properties
                fo:font-size="20pt"
            />

        </style:style>

        <style:style
            style:name="TitlePageSubtitle"
            style:family="paragraph">

            <style:paragraph-properties
                fo:text-align="center"
                fo:margin-top="8mm"
            />

            <style:text-properties
                fo:font-size="18pt"
            />

        </style:style>

        <style:style
            style:name="TitlePageCredit"
            style:family="paragraph">

            <style:paragraph-properties
                fo:text-align="center"
                fo:margin-top="20mm"
            />

            <style:text-properties
                fo:font-size="14pt"
            />

        </style:style>

        <style:style
            style:name="TitlePageAuthor"
            style:family="paragraph">

            <style:paragraph-properties
                fo:text-align="center"
                fo:margin-top="2mm"
            />

            <style:text-properties
                fo:font-size="14pt"
                fo:font-weight="bold"
            />

        </style:style>

        <style:style
            style:name="TitlePageBasedOn"
            style:family="paragraph">

            <style:paragraph-properties
                fo:text-align="center"
                fo:margin-top="8mm"
            />

            <style:text-properties
                fo:font-size="14pt"
            />

        </style:style>

        <!-- ============================================ -->
        <!-- TITLE PAGE LOWER AREA -->
        <!-- ============================================ -->

        <style:style
            style:name="TitlePageFooterContainer"
            style:family="paragraph">

            <style:paragraph-properties
                fo:text-align="left"
            />

        </style:style>

        <style:style
            style:name="TitlePageDraft"
            style:family="paragraph">

            <style:paragraph-properties
                fo:margin-left="20mm"
                fo:margin-top="25mm"
            />

            <style:text-properties
                fo:font-size="14pt"
            />

        </style:style>

        <style:style
            style:name="TitlePageDate"
            style:family="paragraph">

            <style:paragraph-properties
                fo:margin-left="20mm"
                fo:margin-top="2mm"
            />

            <style:text-properties
                fo:font-size="14pt"
            />

        </style:style>

        <style:style
            style:name="TitlePageContact"
            style:family="paragraph">

            <style:paragraph-properties
                fo:margin-left="20mm"
                fo:margin-top="2mm"
            />

            <style:text-properties
                fo:font-size="10pt"
            />

        </style:style>

        <style:style
            style:name="TitlePageCopyright"
            style:family="paragraph">

            <style:paragraph-properties
                fo:text-align="center"
                fo:margin-top="20mm"
            />

            <style:text-properties
                fo:font-size="10pt"
            />

        </style:style>

    </office:styles>

    <office:automatic-styles/>

    <office:master-styles>

        <!-- ============================================ -->
        <!-- FIRST CONTENT PAGE -->
        <!-- ============================================ -->

        <style:master-page
            style:name="FirstContentPage"
            style:page-layout-name="FirstContentPageLayout"
            style:next-style-name="ContentPage">
        </style:master-page>

        <!-- ============================================ -->
        <!-- CONTENT PAGE -->
        <!-- ============================================ -->

        <style:master-page
            style:name="ContentPage"
            style:page-layout-name="ContentPageLayout">

            ${pageNumberPosition !== "none" && pageNumberIsTop
                ? `
                <style:header>
                    <text:p text:style-name="PageNumber">
                        <text:page-number/>
                    </text:p>
                </style:header>
                `
                : ""
            }

            ${pageNumberPosition !== "none" && !pageNumberIsTop
                ? `
                <style:footer>
                    <text:p text:style-name="PageNumber">
                        <text:page-number/>
                    </text:p>
                </style:footer>
                `
                : ""
            }

        </style:master-page>

        <!-- ============================================ -->
        <!-- TITLE PAGE -->
        <!-- ============================================ -->

        <style:master-page
            style:name="TitlePage"
            style:page-layout-name="TitlePageLayout"
        />

        <!-- ============================================ -->
        <!-- PAGE LAYOUTS -->
        <!-- ============================================ -->

        <style:page-layout
            style:name="ContentPageLayout">

            <style:page-layout-properties
                fo:page-width="210mm"
                fo:page-height="297mm"
                fo:margin-left="20mm"
                fo:margin-right="20mm"
                fo:margin-top="15.88mm"
                fo:margin-bottom="21.17mm"
            />

        </style:page-layout>

        <style:page-layout
            style:name="TitlePageLayout">

            <style:page-layout-properties
                fo:page-width="210mm"
                fo:page-height="297mm"
                fo:margin-left="20mm"
                fo:margin-right="20mm"
                fo:margin-top="20mm"
                fo:margin-bottom="20mm"
            />

        </style:page-layout>

    </office:master-styles>

</office:document-styles>`;
}

// ============================================================
// SETTINGS XML
// ============================================================

function buildSettingsXml(): string {

    return `<?xml version="1.0" encoding="UTF-8"?>

<office:document-settings
    xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
    xmlns:config="urn:oasis:names:tc:opendocument:xmlns:config:1.0"
    office:version="1.3">

    <office:settings/>

</office:document-settings>`;
}

// ============================================================
// META XML
// ============================================================

function buildMetaXml(
    project: ScriptProject
): string {

    return `<?xml version="1.0" encoding="UTF-8"?>

<office:document-meta
    xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
    xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    office:version="1.3">

    <office:meta>

        <dc:title>
            ${escapeXml(
                project.title ||
                "Roteiro"
            )}
        </dc:title>

        <dc:creator>
            ${escapeXml(
                project.author ||
                ""
            )}
        </dc:creator>

    </office:meta>

</office:document-meta>`;
}

// ============================================================
// MANIFEST XML
// ============================================================

function buildManifestXml(
    hasImage: boolean
): string {

    let imageEntry = "";

    if (hasImage) {

        imageEntry =
            `
    <manifest:file-entry
        manifest:full-path="Pictures/title-page.png"
        manifest:media-type="image/png"
    />`;

    }

    return `<?xml version="1.0" encoding="UTF-8"?>

<manifest:manifest
    xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"
    manifest:version="1.3">

    <manifest:file-entry
        manifest:full-path="/"
        manifest:media-type="application/vnd.oasis.opendocument.text"
    />

    <manifest:file-entry
        manifest:full-path="content.xml"
        manifest:media-type="text/xml"
    />

    <manifest:file-entry
        manifest:full-path="styles.xml"
        manifest:media-type="text/xml"
    />

    <manifest:file-entry
        manifest:full-path="meta.xml"
        manifest:media-type="text/xml"
    />

    <manifest:file-entry
        manifest:full-path="settings.xml"
        manifest:media-type="text/xml"
    />

    <manifest:file-entry
        manifest:full-path="META-INF/manifest.xml"
        manifest:media-type="text/xml"
    />

    ${imageEntry}

</manifest:manifest>`;
}

// ============================================================
// PACKAGE
// ============================================================

async function buildOdt(
    project: ScriptProject,
    pageNumberPosition: OdtPageNumberPosition,
    projectFilePath: string | null
): Promise<Uint8Array> {

    const zip =
        new JSZip();

    // --------------------------------------------------------
    // Imagem
    // --------------------------------------------------------

    const titleImage =
        await loadTitlePageImage(
            project,
            projectFilePath
        );

    // --------------------------------------------------------
    // mimetype
    // --------------------------------------------------------

    zip.file(
        "mimetype",
        "application/vnd.oasis.opendocument.text",
        {
            compression: "STORE",
        }
    );

    // --------------------------------------------------------
    // XML
    // --------------------------------------------------------

    zip.file(
        "content.xml",
        buildContentXml(
            project,
            projectFilePath,
            titleImage
        )
    );

    zip.file(
        "styles.xml",
        buildStylesXml(
            project,
            pageNumberPosition
        )
    );

    zip.file(
        "settings.xml",
        buildSettingsXml()
    );

    zip.file(
        "meta.xml",
        buildMetaXml(
            project
        )
    );

    zip.file(
        "META-INF/manifest.xml",
        buildManifestXml(
            titleImage !== null
        )
    );

    // --------------------------------------------------------
    // Imagem
    // --------------------------------------------------------

    if (titleImage) {

        zip.file(
            `Pictures/${titleImage.name}`,
            titleImage.data
        );

    }

    // --------------------------------------------------------
    // ZIP
    // --------------------------------------------------------

    return zip.generateAsync(
        {
            type: "uint8array",
            compression: "DEFLATE",
            compressionOptions: {
                level: 6,
            },
        }
    );

}

// ============================================================
// EXPORT
// ============================================================

export async function exportProjectToODT(
    project: ScriptProject,
    pageNumberPosition: OdtPageNumberPosition,
    projectFilePath: string | null
): Promise<void> {

    const fileName =
        project.title.trim() ||
        "Roteiro";

    const filePath =
        await save(
            {
                defaultPath:
                    `${fileName}.odt`,

                filters: [
                    {
                        name:
                            "OpenDocument Text",

                        extensions:
                            ["odt"],
                    },
                ],
            }
        );

    if (!filePath) {

        return;

    }

    const bytes =
        await buildOdt(
            project,
            pageNumberPosition,
            projectFilePath
        );

    await writeFile(
        filePath,
        bytes
    );

}