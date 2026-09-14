// FileBar.tsx
// src/editor/components/FileBar/

// Barra superior com as opções file, view, etc

import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import type { SearchResult } from "../../services/SearchService";
import type { BlockType, ParagraphAlignment } from "../../../types/script";
import type { Settings } from "../../../types/settings";
// -------------------------------------- //
type Props = {
  onNew: () => void;
  onSave: () => void;
  onSaveAs: () => void | Promise<void>;
  onOpen: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExportPDF: () => void;
  onExportODT: () => void;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onToggleUnderline: () => void;
  onToggleStrike: () => void;
  onLowercaseText: () => void;
  onUppercaseText: () => void;
  onSetParagraphAlignment: (
      alignment: ParagraphAlignment
  ) => void;
  onChangeBlockType: (
      blockType: BlockType
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

  settings: Settings;

  setSettings: React.Dispatch<
    React.SetStateAction<Settings>
  >;

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
  onExportODT,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onToggleStrike,
  onLowercaseText,
  onUppercaseText,
  onSetParagraphAlignment,
  onChangeBlockType,
  searchTerm,
  setSearchTerm,
  searchResults,
  currentResultIndex,
  onNextResult,
  onPrevResult,
  onToggleNavigator,
  onCover,
  settings,
  setSettings,

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
  
// função para fechar menu ao abrir/clicar em algo
const closeMenus = () => {
  setActiveMenu(null);
  setShowPageNumberMenu(false);
};

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

      {/* =====================================================
          NAVEGAÇÃO PRINCIPAL
      ====================================================== */}

      <div className="filebar-navigation">

        <Link
          to="/"
          className="filebar-home"
          title="Editor"
        >
          ✍️
        </Link>

      </div>


      {/* =====================================================
          FILE
      ====================================================== */}

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

            <button
              onClick={() => {
                closeMenus();
                onNew();
              }}
            >
              Novo
            </button>

            <button
              onClick={() => {
                closeMenus();
                onOpen();
              }}
            >
              Abrir
            </button>

            <button
              onClick={() => {
                closeMenus();
                onSave();
              }}
            >
              Salvar
            </button>

            <button
              type="button"
              onClick={() => {
                closeMenus();
                void onSaveAs();
              }}
            >
              Salvar como
            </button>

            <hr />

          {/* EXPORTAR */}
          <div className="file-menu-item submenu-wrapper">
              <button
                  type="button"
                  className="file-menu-button submenu-trigger"
              >
                  <span>Exportar</span>
                  <span className="submenu-arrow">▶</span>
              </button>

              <div className="file-submenu">
                  <button
                      type="button"
                      className="file-menu-button"
                      onClick={() => {
                          closeMenus();
                          onExportPDF();
                      }}
                  >
                      📄 PDF
                  </button>

                  <button
                      type="button"
                      className="file-menu-button"
                      onClick={() => {
                          closeMenus();
                          onExportODT();
                      }}
                  >
                      📝 ODT (LibreOffice)
                  </button>
              </div>
          </div>
          {/* FIM DO EXPORTAR */}

          </div>

        )}

      </div>


      {/* =====================================================
          VIEW
      ====================================================== */}

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
                onClick={() => {
                  closeMenus();
                  onToggleNavigator();
                }}
              >
              <span>👁 Cenas</span>
              <span>
                {showNavigator ? "✓" : ""}
              </span>
            </button>

            <button
                className="view-menu-item"
                onClick={() => {
                  closeMenus();
                  onToggleNavigator();
                }}
              >
              <span>🛠 Barra de Ferramentas</span>
              <span>
                {showToolbar ? "✓" : ""}
              </span>
            </button>

            <button
                className="view-menu-item"
                onClick={() => {
                  closeMenus();
                  onToggleNavigator();
                }}
              >
              <span>📊 Barra de Status</span>
              <span>
                {showStatusBar ? "✓" : ""}
              </span>
            </button>

            <button
                className="view-menu-item"
                onClick={() => {
                  closeMenus();
                  onToggleNavigator();
                }}
              >
              <span>↕ Mover blocos</span>
              <span>
                {allowMoveBlocks ? "✓" : ""}
              </span>
            </button>

            <button
                className="view-menu-item"
                onClick={() => {
                  closeMenus();
                  onToggleNavigator();
                }}
              >
              <span>🗑️ Excluir blocos</span>
              <span>
                {allowDeleteBlocks ? "✓" : ""}
              </span>
            </button>


            {/* NUMERAÇÃO DA PÁGINA */}

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
                    onClick={() => {
                      closeMenus();
                      onChangePageNumberPosition("top-right");
                    }}
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
                    onClick={() => {
                      closeMenus();
                      onChangePageNumberPosition("top-left");
                    }}
                  >
                    <span>
                      Superior esquerdo
                    </span>

                    <span>
                      {pageNumberPosition === "top-left"
                        ? "✓"
                        : ""}
                    </span>
                  </button>

                  <button
                    className="view-menu-item"
                    onClick={() => {
                      closeMenus();
                      onChangePageNumberPosition("bottom-right");
                    }}
                  >
                    <span>
                      Inferior direito
                    </span>

                    <span>
                      {pageNumberPosition === "bottom-right"
                        ? "✓"
                        : ""}
                    </span>
                  </button>

                  <button
                    className="view-menu-item"
                    onClick={() => {
                      closeMenus();
                      onChangePageNumberPosition("bottom-left");
                    }}
                  >
                    <span>
                      Inferior esquerdo
                    </span>

                    <span>
                      {pageNumberPosition === "bottom-left"
                        ? "✓"
                        : ""}
                    </span>
                  </button>

                  <button
                    className="view-menu-item"
                    onClick={() => {
                      closeMenus();
                      onChangePageNumberPosition("none");
                    }}
                  >
                    <span>
                      Não mostrar
                    </span>

                    <span>
                      {pageNumberPosition === "none"
                        ? "✓"
                        : ""}
                    </span>
                  </button>

                </div>

              )}

            </div>

            {/* FIM NUMERAÇÃO DA PÁGINA */}

          </div>

        )}

      </div>


      {/* =====================================================
          TITLE PAGE
      ====================================================== */}

      <button
        className="filebar-title-page-button"
        onClick={() => {

          closeMenus();
          onCover();

        }}
      >
        Title Page
      </button>


      {/* =====================================================
          UNDO / REDO
      ====================================================== */}

      <div className="filebar-history-tools">

         <Link
          to="/guide"
          className="filebar-navigation-link"
        >
          Guia
        </Link>

        <Link
          to="/repository"
          className="filebar-navigation-link"
        >
          Repositório
        </Link>

        <Link
          to="/settings"
          className="filebar-navigation-link"
        >
          Configurações
        </Link>

      </div>

      {/* =====================================================
          FERRAMENTAS DE FORMATAÇÃO
      ====================================================== */}

      <div className="filebar-format-tools">

        <button
          onMouseDown={(e) =>
            e.preventDefault()
          }
          onClick={onUndo}
          title="Desfazer"
        >
          ↶
        </button>

        <button
          onMouseDown={(e) =>
            e.preventDefault()
          }
          onClick={onRedo}
          title="Refazer"
        >
          ↷
        </button>

        {/* BOLD */}

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


        {/* ITÁLICO */}

        <button
          type="button"
          className="format-tool-button"
          title="Itálico (Ctrl+I)"
          onMouseDown={(event) =>
            event.preventDefault()
          }
          onClick={onToggleItalic}
        >
          <em>I</em>
        </button>


        {/* SUBLINHADO */}

        <button
          type="button"
          className="format-tool-button"
          title="Sublinhado (Ctrl+U)"
          onMouseDown={(event) =>
            event.preventDefault()
          }
          onClick={onToggleUnderline}
        >
          <u>U</u>
        </button>


        {/* TACHADO */}

        <button
          type="button"
          className="format-tool-button"
          title="Tachado (Ctrl+Shift+X)"
          onMouseDown={(event) =>
            event.preventDefault()
          }
          onClick={onToggleStrike}
        >
          <s>S</s>
        </button>


        <span className="format-tool-separator" />


        {/* ALINHAMENTO */}

        <button
          type="button"
          className="format-tool-button"
          title="Alinhar à esquerda"
          onMouseDown={(event) =>
            event.preventDefault()
          }
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
          onMouseDown={(event) =>
            event.preventDefault()
          }
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
          onMouseDown={(event) =>
            event.preventDefault()
          }
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
          onMouseDown={(event) =>
            event.preventDefault()
          }
          onClick={() =>
            onSetParagraphAlignment("justify")
          }
        >
          ≡
        </button>


        {/* MAIÚSCULA / MINÚSCULA */}

        <span className="format-tool-separator" />

        <button
          type="button"
          className="format-tool-button"
          title="Transformar em minúsculas"
          onMouseDown={(e) =>
            e.preventDefault()
          }
          onClick={onLowercaseText}
        >
          <span style={{ fontSize: "13px" }}>
            a
          </span>
        </button>

        <button
          type="button"
          className="format-tool-button"
          title="Transformar em maiúsculas"
          onMouseDown={(e) =>
            e.preventDefault()
          }
          onClick={onUppercaseText}
        >
          <span style={{ fontSize: "13px" }}>
            A
          </span>
        </button>


        {/* TYPE */}

        <span className="format-tool-separator" />

        <select
          className="format-block-type-select"
          title="Tipo do bloco"
          defaultValue=""
          onMouseDown={(e) =>
            e.stopPropagation()
          }
          onChange={(e) => {

            const value =
              e.target.value as BlockType;

            if (!value) {
              return;
            }

            onChangeBlockType(value);

            e.target.value = "";

          }}
        >
          <option value="">
            Type
          </option>

          <option value="scene">
            Scene
          </option>

          <option value="action">
            Action
          </option>

          <option value="character">
            Character
          </option>

          <option value="dialogue">
            Dialogue
          </option>

          <option value="parenthetical">
            Parenthetical
          </option>

          <option value="shot">
            Shot
          </option>

          <option value="transition">
            Transition
          </option>

        </select>

      </div>


      {/* =====================================================
          BUSCA
      ====================================================== */}

      <div className="search-container">

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


        <div className="filebar-search">

          <input
            id="search-input"
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

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


        {/* CONTADOR */}

        <span className="search-counter">

          {searchResults.length === 0
            ? "0 / 0"
            : `${currentResultIndex + 1} / ${searchResults.length}`}

        </span>


        {/* NAVEGAÇÃO DA BUSCA */}

        <button
          className="search-nav-button"
          onClick={onPrevResult}
        >
          ▲
        </button>

        <button
          className="search-nav-button"
          onClick={onNextResult}
        >
          ▼
        </button>


        {/* SUBSTITUIÇÃO */}

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

      {/* =====================================================
          TEMA
      ===================================================== */}

      <button
        type="button"
        className="filebar-theme-button"
        onClick={() =>
          setSettings({
            ...settings,
            theme:
              settings.theme === "dark"
                ? "light"
                : "dark",
          })
        }
        title={
          settings.theme === "dark"
            ? "Modo claro"
            : "Modo escuro"
        }
      >
        {settings.theme === "dark"
          ? "☀️"
          : "🌙"}
      </button>



    </div>
  );
  
}