// FileBar.tsx
// src/editor/components/FileBar/

// Barra superior com as opções file, view, etc

import { useEffect, useState, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { SearchResult } from "../../services/SearchService";
import type { ParagraphAlignment } from "../../../types/script";
// -------------------------------------- //
type Props = {
  onNew: () => void;
  onSave: () => void;
  onSaveAs: () => void | Promise<void>;
  onOpen: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExportPDF: () => void;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onToggleUnderline: () => void;
  onToggleStrike: () => void;
  onLowercaseText: () => void;
  onUppercaseText: () => void;
  onSetParagraphAlignment: (
      alignment: ParagraphAlignment
  ) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  searchResults: SearchResult[];
  currentResultIndex: number;
  onNextResult: () => void;
  onPrevResult: () => void;
  onToggleNavigator: () => void;
  onCover: () => void;

  replaceTerm: string;
  setReplaceTerm: React.Dispatch<React.SetStateAction<string>>;
  onReplaceAll: () => void;
  onReplace: () => void;
  

  showNavigator: boolean;
  showToolbar: boolean;
  showStatusBar: boolean;
  onToggleToolbar: () => void;
  onToggleStatusBar: () => void;

  allowMoveBlocks: boolean;
  allowDeleteBlocks: boolean;
  onToggleMoveBlocks: () => void;
  onToggleDeleteBlocks: () => void;

  pageNumberPosition:
    "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "none";

  onChangePageNumberPosition: (
    position:
      | "top-right"
      | "top-left"
      | "bottom-right"
      | "bottom-left"
      | "none"
  ) => void;

  caseSensitive: boolean;

  setCaseSensitive:
      React.Dispatch<
          React.SetStateAction<boolean>
      >;

  ignoreAccents: boolean;

  setIgnoreAccents:
      React.Dispatch<
          React.SetStateAction<boolean>
      >;
};

export default function FileBar({
  onNew,
  onSave,
  onSaveAs,
  onOpen,
  onUndo,
  onRedo,
  onExportPDF,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onToggleStrike,
  onLowercaseText,
  onUppercaseText,
  onSetParagraphAlignment,
  searchTerm,
  setSearchTerm,
  searchResults,
  currentResultIndex,
  onNextResult,
  onPrevResult,
  onToggleNavigator,
  onCover,

  showNavigator,
  showToolbar,
  showStatusBar,
  onToggleStatusBar,
  onToggleToolbar,

  allowMoveBlocks,
  allowDeleteBlocks,

  onToggleMoveBlocks,
  onToggleDeleteBlocks,

  pageNumberPosition,
  onChangePageNumberPosition,

  caseSensitive,
  setCaseSensitive,

  ignoreAccents,
  setIgnoreAccents,
  replaceTerm,
  setReplaceTerm,
  onReplaceAll,
  onReplace,
}: Props) {

// ------------------------------------------------- //

// Função para ativar/desativar barra inferior e barra flutuante
const [activeMenu, setActiveMenu] =
  useState<
    "file"
    | "view"
    | null
  >(null);

const [showPageNumberMenu, setShowPageNumberMenu] =
  useState(false);

// substituir termos pesquisados
const [showReplace, setShowReplace] =
    useState(false);

  // Fechar o menu dropdown ao clicar fora
  const menuRef = useRef<HTMLDivElement>(null);
    //UseEffect para fechar o menu dropdown ao clicar fora
    useEffect(() => {

      function handleClickOutside(event: MouseEvent) {

        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node)
        ) {

          setActiveMenu(null);

        }

      }

      document.addEventListener(
        "mousedown",
        handleClickOutside
      );

      return () =>
        document.removeEventListener(
          "mousedown",
          handleClickOutside
        );

    }, []);

// Função de usar enter para pular para próxima pesquisa
useEffect(() => {

  const handleKeyDown = (
    e: KeyboardEvent
  ) => {

    if (
      e.key === "Enter" &&
      document.activeElement?.id === "search-input"
    ) {

      e.preventDefault();

      onNextResult();
    }

    if (e.key === "F3") {

      e.preventDefault();

      if (e.shiftKey) {
        onPrevResult();
      } else {
        onNextResult();
      }

    }

  };

  window.addEventListener(
    "keydown",
    handleKeyDown
  );

  return () =>
    window.removeEventListener(
      "keydown",
      handleKeyDown
    );

}, [
  onNextResult,
  onPrevResult
]);


// ------------------------------------------------- //  
  return (
    <div
      className="filebar"
      ref={menuRef}
    >

      {/* BOTÕES */}
      <div className="filebar-menu">

        <button
          className="menu-button"
          onClick={() => {

              if (activeMenu === "file") {

                setActiveMenu(null);
                setShowPageNumberMenu(false);

                return;

              }

              setActiveMenu("file");
              setShowPageNumberMenu(false);

            }}

          onMouseEnter={() => {
            if (activeMenu)
              setActiveMenu("file");
          }}
        >
          File
        </button>

        {activeMenu === "file" && (
          <div className="filebar-dropdown">

            <button onClick={onNew}>
              Novo
            </button>

            <button onClick={onOpen}>
              Abrir
            </button>

            <button onClick={onSave}>
              Salvar
            </button>

            <button
                type="button"
                onClick={() => {
                    void onSaveAs();
                }}
            >
                Salvar como
            </button>

            <hr />

            <button
              onClick={() => {
                onExportPDF();
              }}
            >
              Exportar PDF
            </button>

          </div>
        )}

      </div>
    
    <div className="filebar-menu">

      <button
        className="menu-button"
        onClick={() => {

          if (activeMenu === "view") {

            setActiveMenu(null);
            setShowPageNumberMenu(false);

            return;

          }

          setActiveMenu("view");

        }}

        onMouseEnter={() => {
          if (activeMenu)
            setActiveMenu("view");
        }}
      >
        View
      </button>

      {activeMenu === "view" && (
        <div className="filebar-dropdown">

          <button
            className="view-menu-item"
            onClick={onToggleNavigator}
          >
            <span>👁 Cenas</span>
            <span>{showNavigator ? "✓" : ""}</span>
          </button>

          <button
            className="view-menu-item"
            onClick={onToggleToolbar}
          >
            <span>🛠 Barra de Ferramentas</span>
            <span>{showToolbar ? "✓" : ""}</span>
          </button>

          <button
            className="view-menu-item"
            onClick={onToggleStatusBar}
          >
            <span>📊 Barra de Status</span>
            <span>{showStatusBar ? "✓" : ""}</span>
          </button>

          <button
            className="view-menu-item"
            onClick={onToggleMoveBlocks}
          >
            <span>↕ Mover blocos</span>
            <span>
              {allowMoveBlocks ? "✓" : ""}
            </span>
          </button>

          <button
            className="view-menu-item"
            onClick={onToggleDeleteBlocks}
          >
            <span>🗑️ Excluir blocos</span>
            <span>
              {allowDeleteBlocks ? "✓" : ""}
            </span>
          </button>

          {/* NUMERAÇÃO PÁGINA */}
          <hr />
            <div className="page-number-menu-wrapper">

              <button
                className="view-menu-item page-number-menu-trigger"
                onMouseEnter={() =>
                  setShowPageNumberMenu(true)
                }
              >
                <span>🔢 Número da página</span>
                <span>›</span>
              </button>

              {showPageNumberMenu && (
                <div
                  className="page-number-position-menu"
                  onMouseEnter={() =>
                    setShowPageNumberMenu(true)
                  }
                  onMouseLeave={() =>
                    setShowPageNumberMenu(false)
                  }
                >

                <button
                  className="view-menu-item"
                  onClick={() =>
                    onChangePageNumberPosition(
                      "top-right"
                    )
                  }
                >
                  <span>
                    Superior direito
                    <small className="default-option">
                      (Padrão)
                    </small>
                  </span>

                  <span>
                    {pageNumberPosition === "top-right"
                      ? "✓"
                      : ""}
                  </span>
                </button>

                <button
                  className="view-menu-item"
                  onClick={() =>
                    onChangePageNumberPosition(
                      "top-left"
                    )
                  }
                >
                  <span>Superior esquerdo</span>
                  <span>
                    {pageNumberPosition === "top-left"
                      ? "✓"
                      : ""}
                  </span>
                </button>

                <button
                  className="view-menu-item"
                  onClick={() =>
                    onChangePageNumberPosition(
                      "bottom-right"
                    )
                  }
                >
                  <span>Inferior direito</span>
                  <span>
                    {pageNumberPosition === "bottom-right"
                      ? "✓"
                      : ""}
                  </span>
                </button>

                <button
                  className="view-menu-item"
                  onClick={() =>
                    onChangePageNumberPosition(
                      "bottom-left"
                    )
                  }
                >
                  <span>Inferior esquerdo</span>
                  <span>
                    {pageNumberPosition === "bottom-left"
                      ? "✓"
                      : ""}
                  </span>
                </button>

                <button
                  className="view-menu-item"
                  onClick={() =>
                    onChangePageNumberPosition(
                      "none"
                    )
                  }
                >
                  <span>Não mostrar</span>
                  <span>
                    {pageNumberPosition === "none"
                      ? "✓"
                      : ""}
                  </span>
                </button>

              </div>
            )}
          </div>
          {/* FIM NUMERAÇÃO PÁGINA*/}

        </div>
      )}
      </div>

      {/* CAPA */}
       <button
        onClick={() => {

          setActiveMenu(null);

          onCover();

          }}
          >
          Title Page
        </button>
        {/* FIM DA CAPA */}

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={onUndo}
      >
        ↶ {/* desfazer */}
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={onRedo}
      >
        ↷  {/* refazer */}
      </button>

      {/* FERRAMENTAS DE FORMATAÇÃO */}
      <div className="filebar-format-tools">

        <button
          type="button"
          className="format-tool-button"
          title="Negrito (Ctrl+B)"
          onMouseDown={(e) =>
            e.preventDefault()
          }
          onClick={onToggleBold}
        >
          <strong>B</strong>
        </button>

        <button
            type="button"
            className="format-tool-button"
            title="Itálico (Ctrl+I)"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onToggleItalic}
        >
            <em>I</em>
        </button>

        <button
            type="button"
            className="format-tool-button"
            title="Sublinhado (Ctrl+U)"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onToggleUnderline}
        >
            <u>U</u>
        </button>

        <button
            type="button"
            className="format-tool-button"
            title="Tachado (Ctrl+Shift+X)"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onToggleStrike}
        >
            <s>S</s>
        </button>

        <span className="format-tool-separator" />

        {/* BOTÕES DE ALINHAMENTO */}
        <button
            type="button"
            className="format-tool-button"
            title="Alinhar à esquerda"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
                onSetParagraphAlignment("left")
            }
        >
            ≡
        </button>

        <button
            type="button"
            className="format-tool-button"
            title="Centralizar"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
                onSetParagraphAlignment("center")
            }
        >
            ≡
        </button>

        <button
            type="button"
            className="format-tool-button"
            title="Alinhar à direita"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
                onSetParagraphAlignment("right")
            }
        >
            ≡
        </button>

        <button
            type="button"
            className="format-tool-button"
            title="Justificar"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
                onSetParagraphAlignment("justify")
            }
        >
            ≡
        </button>
        {/*FIM DOS BOTÕES DE ALINHAMENTO*/}

        {/*MAIUSCULO E MINUSCULO*/}
        <span className="format-tool-separator" />

        <button
            type="button"
            className="format-tool-button"
            title="Transformar em minúsculas"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onLowercaseText}
        >
            <span style={{ fontSize: "13px" }}>a</span>
        </button>

        <button
            type="button"
            className="format-tool-button"
            title="Transformar em maiúsculas"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onUppercaseText}
        >
            <span style={{ fontSize: "13px" }}>A</span>
        </button>
        {/*FIM DO MAIUSCULO E MINUSCULO*/}

      </div>
      {/* FIM FERRAMENTAS DE FORMATAÇÃO */}


    <div className="search-container">

      {/*BOTÃO DE EXPANDIR*/}
        <button
            className={
                `search-expand-button ${
                    showReplace
                        ? "active"
                        : ""
                }`
            }
            onMouseDown={(e) =>
                e.preventDefault()
            }
            onClick={() =>
                setShowReplace(
                    previous => !previous
                )
            }
            title="Mostrar opções de substituição"
        >
            &gt;
        </button>
        
      {/*FILEBAR-SEARCH*/}
      <div className="filebar-search">

        {/*BARRA DE BUSCA*/}
        <input
          id="search-input"
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />

        {/*MAIÚSCULA/MINÚSCULA E ACENTOS BOTÕES*/}
        <button
            type="button"
            className={
                `search-option-button ${
                    caseSensitive
                        ? "active"
                        : ""
                }`
            }
            title="Diferenciar maiúsculas e minúsculas"
            onMouseDown={(e) =>
                e.preventDefault()
            }
            onClick={() =>
                setCaseSensitive(
                    prev => !prev
                )
            }
        >
            Aa
        </button>

        <button
            type="button"
            className={
                `search-option-button ${
                    ignoreAccents
                        ? "active"
                        : ""
                }`
            }
            title="Ignorar acentos"
            onMouseDown={(e) =>
                e.preventDefault()
            }
            onClick={() =>
                setIgnoreAccents(
                    prev => !prev
                )
            }
        >
            á
        </button>

      </div>
    {/*FIM DO FILEBAR-SEARCH*/}

        {/*CONTADOR DE RESULTADOS*/}
        <span className="search-counter">
          {searchResults.length === 0
            ? "0 / 0"
            : `${currentResultIndex + 1} / ${searchResults.length}`}

        </span>

        {/*BOTÕES PRÓXIMO E ANTERIOR*/}
        <button className="search-nav-button" onClick={onPrevResult}>
          ▲
        </button>

        <button className="search-nav-button" onClick={onNextResult}>
          ▼
        </button>

      {showReplace && (
          <div className="search-replace-panel">

              <input
                  type="text"
                  className="replace-input"
                  placeholder="Substituir por..."
                  value={replaceTerm}
                  onChange={(e) =>
                      setReplaceTerm(
                          e.target.value
                      )
                  }
              />

              <button
                  className="replace-button"
                  title="Substituir resultado atual"
                  onClick={onReplace}
              >
                  Substituir
              </button>

              <button
                  className="replace-all-button"
                  title="Substituir todos os resultados"
                  onClick={onReplaceAll}
              >
                  Substituir todos
              </button>

          </div>
      )}
      
      </div>
    </div>
  );
}