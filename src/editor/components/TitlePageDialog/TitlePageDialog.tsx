// TitlePageDialog.tsx
// src/editor/components/TitlePageDialog/

// RESPONSÁVEL PELA PÁGINA DE TÍTULO DO ROTEIRO

import "./TitlePageDialog.css";
import { useState } from "react";
import type { ScriptProject } from "../../../types/project";

// -------------------------------------------------------- //

type Props = {

    project: ScriptProject;

    setProject:
        React.Dispatch<
            React.SetStateAction<ScriptProject>
        >;

    onClose: () => void;

};

// -------------------------------------------------------- //

export default function TitlePageDialog({

    project,
    setProject,
    onClose,

}: Props) {

    // ----------------------------------------------------
    // RASCUNHO LOCAL
    // ----------------------------------------------------
    // As alterações ficam aqui enquanto a janela está aberta.
    // Só vão para o projeto quando o usuário clicar em Salvar.

    const [draft, setDraft] =
        useState<ScriptProject>(
            structuredClone(project)
        );

    // ----------------------------------------------------
    // SALVAR
    // ----------------------------------------------------

    const handleSave = () => {

        setProject(
            draft
        );

        onClose();

    };

    // ----------------------------------------------------
    // CANCELAR
    // ----------------------------------------------------

    const handleCancel = () => {

        // O draft é simplesmente descartado.
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

                {/* CONTEÚDO */}

                <div className="title-page-dialog-content">

                    <label className="title-page-checkbox">

                        <input
                            type="checkbox"
                            checked={
                                draft.titlePage.enabled
                            }
                            onChange={(event) =>
                                setDraft(prev => ({
                                    ...prev,

                                    titlePage: {
                                        ...prev.titlePage,

                                        enabled:
                                            event.target.checked,
                                    },
                                }))
                            }
                        />

                        Usar página de título

                    </label>

                    <div className="title-page-field">

                        <label>
                            Título
                        </label>

                        <input
                            type="text"
                            value={draft.titlePage.title}
                            onChange={(event) =>
                                setDraft(prev => ({
                                    ...prev,

                                    titlePage: {
                                        ...prev.titlePage,

                                        title:
                                            event.target.value,
                                    },
                                }))
                            }
                            placeholder="Título da página de título"
                        />

                    </div>

                    <div className="title-page-field">

                        <label>
                            Autor
                        </label>

                        <input
                            type="text"
                            value={draft.author}
                            onChange={(event) =>
                                setDraft(prev => ({
                                    ...prev,

                                    author:
                                        event.target.value,
                                }))
                            }
                            placeholder="Nome do autor"
                        />

                    </div>

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
                                setDraft(prev => ({
                                    ...prev,

                                    titlePage: {
                                        ...prev.titlePage,

                                        subtitle:
                                            event.target.value,
                                    },
                                }))
                            }
                            placeholder="Opcional"
                        />

                    </div>

                    <div className="title-page-field">

                        <label>
                            Data
                        </label>

                        <input
                            type="text"
                            value={
                                draft.titlePage.date
                            }
                            onChange={(event) =>
                                setDraft(prev => ({
                                    ...prev,

                                    titlePage: {
                                        ...prev.titlePage,

                                        date:
                                            event.target.value,
                                    },
                                }))
                            }
                            placeholder="Opcional"
                        />

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