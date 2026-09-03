// TitlePageDialog.tsx
// src/editor/components/TitlePageDialog/

// RESPONSÁVEL PELA PÁGINA DE TÍTULO DO ROTEIRO

import "./TitlePageDialog.css";
import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import type {
    ScriptProject,
    TitlePageCreditType,
} from "../../../types/project";

// -------------------------------------------------------- //

type Props = {

    project: ScriptProject;

    setProject:
        React.Dispatch<
            React.SetStateAction<ScriptProject>
        >;

    onClose: () => void;

    importProjectAsset: (
        sourcePath: string
    ) => Promise<string | null>;

};

// -------------------------------------------------------- //

export default function TitlePageDialog({

    project,
    setProject,
    onClose,
    importProjectAsset,

}: Props) {

    // ----------------------------------------------------
    // RASCUNHO LOCAL
    // ----------------------------------------------------

    const [draft, setDraft] =
        useState<ScriptProject>(
            structuredClone(project)
        );

    // ----------------------------------------------------
    // ATUALIZA PÁGINA DE TÍTULO
    // ----------------------------------------------------

    const updateTitlePage = <
        K extends keyof ScriptProject["titlePage"]
    >(
        field: K,
        value: ScriptProject["titlePage"][K]
    ) => {

        setDraft(prev => ({

            ...prev,

            titlePage: {

                ...prev.titlePage,

                [field]: value,

            },

        }));

    };

    // ----------------------------------------------------
    // ATUALIZA CRÉDITO PRINCIPAL
    // ----------------------------------------------------

    const updatePrimaryCredit = (
        field: "type" | "name",
        value: TitlePageCreditType | string
    ) => {

        setDraft(prev => ({

            ...prev,

            titlePage: {

                ...prev.titlePage,

                primaryCredit: {

                    ...prev.titlePage.primaryCredit,

                    [field]: value,

                },

            },

        }));

    };

    // ----------------------------------------------------
    // ATUALIZA CONTATO
    // ----------------------------------------------------

    const updateContact = <
        K extends keyof ScriptProject["titlePage"]["contact"]
    >(
        field: K,
        value: ScriptProject["titlePage"]["contact"][K]
    ) => {

        setDraft(prev => ({

            ...prev,

            titlePage: {

                ...prev.titlePage,

                contact: {

                    ...prev.titlePage.contact,

                    [field]: value,

                },

            },

        }));

    };

    // ----------------------------------------------------
    // SELECIONAR IMAGEM DA PÁGINA DE TÍTULO
    // ----------------------------------------------------

    const handleSelectImage = async () => {
        try {
            const selected = await open({
                multiple: false,
                directory: false,
                filters: [
                    {
                        name: "Imagens",
                        extensions: [
                            "png",
                            "jpg",
                            "jpeg",
                            "webp",
                        ],
                    },
                ],
            });

            if (typeof selected !== "string") {
                return;
            }

            const importedPath =
                await importProjectAsset(selected);

            if (!importedPath) {
                return;
            }

            updateTitlePage(
                "imagePath",
                importedPath
            );

        } catch (error) {
            console.error(
                "Erro ao selecionar imagem:",
                error
            );
        }
    };

    // ----------------------------------------------------
    // SALVAR
    // ----------------------------------------------------
    const handleSave = () => {

        if (
            draft.titlePage.enabled
        ) {

            if (
                draft.titlePage.visualMode === "text" &&
                !draft.titlePage.title.trim()
            ) {

                alert(
                    "Informe o título da obra."
                );

                return;

            }

            if (
                !draft.titlePage.primaryCredit.name.trim()
            ) {

                alert(
                    "Informe o nome do crédito principal."
                );

                return;

            }

        }

        setProject(
            draft
        );

        onClose();

    };

    // ----------------------------------------------------
    // CANCELAR
    // ----------------------------------------------------

    const handleCancel = () => {

        onClose();

    };

    // ----------------------------------------------------
    // JSX
    // ----------------------------------------------------

    return (

        <div
            className="title-page-dialog-overlay"
            onMouseDown={(event) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {

                    handleCancel();

                }

            }}
        >

            <div className="title-page-dialog">

                {/* CABEÇALHO */}

                <div className="title-page-dialog-header">

                    <h2>
                        📄 Página de título
                    </h2>

                    <button
                        type="button"
                        className="title-page-dialog-close"
                        onClick={handleCancel}
                    >
                        ×
                    </button>

                </div>

                {/* CORPO */}

                <div className="title-page-dialog-body">

                    {/* =================================================
                    BARRA LATERAL — FORMATO
                    ================================================= */}

                    <aside className="title-page-format-sidebar">

                        <div className="title-page-format-sidebar-title">
                            FORMATO
                        </div>

                        <button
                            type="button"
                            className={
                                `title-page-format-button ${
                                    draft.format === "film"
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                setDraft(prev => ({
                                    ...prev,
                                    format: "film",
                                }))
                            }
                        >

                            <span className="title-page-format-icon">
                                🎬
                            </span>

                            <span className="title-page-format-name">
                                Filme
                            </span>

                        </button>

                        <button
                            type="button"
                            className={
                                `title-page-format-button ${
                                    draft.format === "series"
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                setDraft(prev => ({
                                    ...prev,
                                    format: "series",
                                }))
                            }
                        >

                            <span className="title-page-format-icon">
                                📺
                            </span>

                            <span className="title-page-format-name">
                                Série
                            </span>

                        </button>

                    </aside>

                    {/* =================================================
                    CONTEÚDO
                    ================================================= */}

                    <div className="title-page-dialog-content">

                        {/* USAR PÁGINA DE TÍTULO */}

                    <label className="title-page-checkbox">

                        <input
                            type="checkbox"
                            checked={
                                draft.titlePage.enabled
                            }
                            onChange={(event) =>
                                updateTitlePage(
                                    "enabled",
                                    event.target.checked
                                )
                            }
                        />

                        Usar página de título

                    </label>

                    {/* ---------------------------------- */}
                    {/* APARÊNCIA                          */}
                    {/* ---------------------------------- */}

                    <div className="title-page-section">

                        <h3>
                            Aparência
                        </h3>

                    </div>

                    <div className="title-page-field">

                        <label>
                            Tipo
                        </label>

                        <select
                            value={
                                draft.titlePage.visualMode
                            }
                            onChange={(event) =>
                                updateTitlePage(
                                    "visualMode",
                                    event.target.value as
                                        | "text"
                                        | "image"
                                        | "background"
                                )
                            }
                        >

                            <option value="text">
                                Texto
                            </option>

                            <option value="image">
                                Imagem no lugar do título
                            </option>

                            <option value="background">
                                Imagem de fundo
                            </option>

                        </select>

                    </div>

                    {(
                        draft.titlePage.visualMode === "image" ||
                        draft.titlePage.visualMode === "background"
                    ) && (

                        <div className="title-page-image-selector">

                            <div className="title-page-field">

                                <label>
                                    Imagem
                                </label>

                                <button
                                    type="button"
                                    className="title-page-image-button"
                                    onClick={handleSelectImage}
                                >
                                    Selecionar imagem...
                                </button>

                            </div>

                            {draft.titlePage.imagePath && (

                                <div className="title-page-image-selected">

                                    <span
                                        className="title-page-image-path"
                                        title={
                                            draft.titlePage.imagePath
                                        }
                                    >
                                        {draft.titlePage.imagePath}
                                    </span>

                                    <button
                                        type="button"
                                        className="title-page-image-remove"
                                        onClick={() =>
                                            updateTitlePage(
                                                "imagePath",
                                                ""
                                            )
                                        }
                                    >
                                        Remover
                                    </button>

                                </div>

                            )}

                        </div>

                    )}

                    {/* TÍTULO */}

                    <div className="title-page-field">

                        <label>
                            Título
                        </label>

                        <input
                            type="text"
                            value={
                                draft.titlePage.title
                            }
                            onChange={(event) =>
                                updateTitlePage(
                                    "title",
                                    event.target.value
                                )
                            }
                            placeholder="Título da obra"
                        />

                    </div>
                    
                    {/* --------------------------------------------------- */}
                    {draft.format === "series" && (

                        <>
                            {/* ---------------------------------- */}
                            {/* SÉRIE                              */}
                            {/* ---------------------------------- */}

                            <div className="title-page-section">

                                <h3>
                                    Episódio
                                </h3>

                            </div>

                            <div className="title-page-fields-row">

                                <div className="title-page-field">

                                    <label>
                                        Número
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            draft.series.episodeNumber
                                        }
                                        onChange={(event) =>
                                            setDraft(prev => ({
                                                ...prev,

                                                series: {

                                                    ...prev.series,

                                                    episodeNumber:
                                                        event.target.value,

                                                },

                                            }))
                                        }
                                        placeholder="Ex.: 01"
                                    />

                                </div>

                                <div className="title-page-field">

                                    <label>
                                        Nome
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            draft.series.episodeTitle
                                        }
                                        onChange={(event) =>
                                            setDraft(prev => ({
                                                ...prev,

                                                series: {

                                                    ...prev.series,

                                                    episodeTitle:
                                                        event.target.value,

                                                },

                                            }))
                                        }
                                        placeholder="Nome do episódio"
                                    />

                                </div>

                            </div>

                        </>

                    )}

                    {/* ---------------------------------- */}
                    {/* CRÉDITO PRINCIPAL                  */}
                    {/* ---------------------------------- */}

                    <div className="title-page-section">

                        <h3>
                            Crédito principal
                        </h3>

                    </div>

                    <div className="title-page-field">

                        <label>
                            Tipo
                        </label>

                        <select
                            value={
                                draft.titlePage.primaryCredit.type
                            }
                            onChange={(event) =>
                                updatePrimaryCredit(
                                    "type",
                                    event.target.value as TitlePageCreditType
                                )
                            }
                        >

                            <option value="written-by">
                                Written by
                            </option>

                            <option value="screenplay-by">
                                Screenplay by
                            </option>

                        </select>

                    </div>

                    <div className="title-page-field">

                        <label>
                            Nome
                        </label>

                        <input
                            type="text"
                            value={
                                draft.titlePage.primaryCredit.name
                            }
                            onChange={(event) =>
                                updatePrimaryCredit(
                                    "name",
                                    event.target.value
                                )
                            }
                            placeholder="Nome exibido na página de título"
                        />

                    </div>

                    {/* ---------------------------------- */}
                    {/* HISTÓRIA                           */}
                    {/* ---------------------------------- */}

                    <div className="title-page-field">

                        <label>
                            Story by
                        </label>

                        <input
                            type="text"
                            value={
                                draft.titlePage.storyBy
                            }
                            onChange={(event) =>
                                updateTitlePage(
                                    "storyBy",
                                    event.target.value
                                )
                            }
                            placeholder="Opcional"
                        />

                    </div>

                    {/* DIREÇÃO */}
                    <div className="title-page-field">

                        <label>
                            Directed by
                        </label>

                        <input
                            type="text"
                            value={
                                draft.titlePage.directedBy
                            }
                            onChange={(event) =>
                                updateTitlePage(
                                    "directedBy",
                                    event.target.value
                                )
                            }
                            placeholder="Opcional"
                        />
                    </div>

                    {/* SUBTÍTULO */}

                    <div className="title-page-field">

                        <label>
                            Subtítulo
                        </label>

                        <input
                            type="text"
                            value={
                                draft.titlePage.subtitle
                            }
                            onChange={(event) =>
                                updateTitlePage(
                                    "subtitle",
                                    event.target.value
                                )
                            }
                            placeholder="Opcional"
                        />

                    </div>

                    {/* BASEADO EM */}

                    <div className="title-page-fields-row">

                        <div className="title-page-field">
                            <label>Based on</label>

                            <input
                                type="text"
                                value={draft.titlePage.basedOn}
                                onChange={(event) =>
                                    updateTitlePage(
                                        "basedOn",
                                        event.target.value
                                    )
                                }
                                placeholder="Opcional"
                            />
                        </div>

                    {/* AUTOR DA OBRA ORIGINAL */}

                    <div className="title-page-field">
                            <label>Based on by</label>

                            <input
                                type="text"
                                value={draft.titlePage.basedOnBy}
                                onChange={(event) =>
                                    updateTitlePage(
                                        "basedOnBy",
                                        event.target.value
                                    )
                                }
                                placeholder="Opcional"
                            />
                        </div>

                    </div>

                    {/* DRAFT */}

                    <div className="title-page-fields-row">

                        <div className="title-page-field">
                            <label>Draft</label>

                            <select
                                value={draft.titlePage.draft}
                                onChange={(event) =>
                                    updateTitlePage(
                                        "draft",
                                        event.target.value
                                    )
                                }
                            >
                                <option value="">Nenhum</option>

                                <option value="First Draft">First Draft</option>
                                <option value="Second Draft">Second Draft</option>
                                <option value="Third Draft">Third Draft</option>
                                <option value="Fourth Draft">Fourth Draft</option>
                                <option value="Fifth Draft">Fifth Draft</option>
                                <option value="Sixth Draft">Sixth Draft</option>
                                <option value="Seventh Draft">Seventh Draft</option>
                                <option value="Eighth Draft">Eighth Draft</option>
                                <option value="Ninth Draft">Ninth Draft</option>
                                <option value="Tenth Draft">Tenth Draft</option>
                                <option value="Eleventh Draft">Eleventh Draft</option>
                                <option value="Twelfth Draft">Twelfth Draft</option>
                                <option value="Thirteenth Draft">Thirteenth Draft</option>
                                <option value="Fourteenth Draft">Fourteenth Draft</option>
                                <option value="Fifteenth Draft">Fifteenth Draft</option>
                                <option value="Sixteenth Draft">Sixteenth Draft</option>
                                <option value="Seventeenth Draft">Seventeenth Draft</option>
                                <option value="Eighteenth Draft">Eighteenth Draft</option>
                                <option value="Nineteenth Draft">Nineteenth Draft</option>
                                <option value="Twentieth Draft">Twentieth Draft</option>
                                <option value="Twenty-First Draft">Twenty-First Draft</option>
                                <option value="Twenty-Second Draft">Twenty-Second Draft</option>
                                <option value="Twenty-Third Draft">Twenty-Third Draft</option>
                                <option value="Twenty-Fourth Draft">Twenty-Fourth Draft</option>
                                <option value="Twenty-Fifth Draft">Twenty-Fifth Draft</option>
                                <option value="Twenty-Sixth Draft">Twenty-Sixth Draft</option>
                                <option value="Twenty-Seventh Draft">Twenty-Seventh Draft</option>
                                <option value="Twenty-Eighth Draft">Twenty-Eighth Draft</option>
                                <option value="Twenty-Ninth Draft">Twenty-Ninth Draft</option>
                                <option value="Thirtieth Draft">Thirtieth Draft</option>
                            </select>
                        </div>

                        <div className="title-page-field">
                            <label>Posição</label>

                            <select
                                value={draft.titlePage.draftPosition}
                                onChange={(event) =>
                                    updateTitlePage(
                                        "draftPosition",
                                        event.target.value as
                                            | "left"
                                            | "center"
                                            | "right"
                                    )
                                }
                            >
                                <option value="left">Esquerda</option>
                                <option value="center">Centro</option>
                                <option value="right">Direita</option>
                            </select>
                        </div>

                    </div>

                    {/* DATA */}

                    <div className="title-page-fields-row">

                        <div className="title-page-field">
                            <label>Data</label>

                            <input
                                type="text"
                                value={draft.titlePage.date}
                                onChange={(event) =>
                                    updateTitlePage(
                                        "date",
                                        event.target.value
                                    )
                                }
                                placeholder="Opcional"
                            />
                        </div>

                        <div className="title-page-field">
                            <label>Posição</label>

                            <select
                                value={draft.titlePage.datePosition}
                                onChange={(event) =>
                                    updateTitlePage(
                                        "datePosition",
                                        event.target.value as
                                            | "left"
                                            | "center"
                                            | "right"
                                    )
                                }
                            >

                                <option value="left">
                                    Esquerda
                                </option>
                                
                                <option value="center">
                                    Centro
                                </option>

                                <option value="right">
                                    Direita
                                </option>
                            </select>
                        </div>

                    </div>

                    {/* COPYRIGHT */}
                    <div className="title-page-field">

                        <label>
                            Copyright
                        </label>

                        <input
                            type="text"
                            value={
                                draft.titlePage.copyright
                            }
                            onChange={(event) =>
                                updateTitlePage(
                                    "copyright",
                                    event.target.value
                                )
                            }
                            placeholder="Opcional"
                        />

                    </div>

                    {/* ---------------------------------- */}
                    {/* CONTATO                            */}
                    {/* ---------------------------------- */}

                    <div className="title-page-section">

                        <h3>
                            Contato
                        </h3>

                    </div>

                    {/* ENDEREÇO */}

                    <div className="title-page-field">

                        <label>
                            Endereço
                        </label>

                        <input
                            type="text"
                            value={
                                draft.titlePage.contact.address
                            }
                            onChange={(event) =>
                                updateContact(
                                    "address",
                                    event.target.value
                                )
                            }
                            placeholder="Opcional"
                        />

                    </div>

                    {/* TELEFONE */}

                    <div className="title-page-field">

                        <label>
                            Telefone
                        </label>

                        <input
                            type="text"
                            value={
                                draft.titlePage.contact.phone
                            }
                            onChange={(event) =>
                                updateContact(
                                    "phone",
                                    event.target.value
                                )
                            }
                            placeholder="Opcional"
                        />

                    </div>

                    {/* E-MAIL */}

                    <div className="title-page-field">

                        <label>
                            E-mail
                        </label>

                        <input
                            type="email"
                            value={
                                draft.titlePage.contact.email
                            }
                            onChange={(event) =>
                                updateContact(
                                    "email",
                                    event.target.value
                                )
                            }
                            placeholder="Opcional"
                        />

                    </div>

                </div>
            </div>

                {/* RODAPÉ */}

                <div className="title-page-dialog-footer">

                    <button
                        type="button"
                        className="title-page-cancel-button"
                        onClick={handleCancel}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        className="title-page-save-button"
                        onClick={handleSave}
                    >
                        Salvar
                    </button>

                </div>

            </div>

        </div>

    );

}