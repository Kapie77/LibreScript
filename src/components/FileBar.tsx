import { useEffect, useState, useRef } from "react";
// -------------------------------------- //
type Props = {
  onNew: () => void;
  onSave: () => void;
  onOpen: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExportPDF: () => void;
  searchTerm: string;
  setSearchTerm:
    React.Dispatch<
      React.SetStateAction<string>
    >;
  searchResults: number[];
  currentResultIndex: number;
  onNextResult: () => void;
  onPrevResult: () => void;
  onToggleNavigator: () => void;

  showNavigator: boolean;
  showToolbar: boolean;
  showStatusBar: boolean;
  onToggleToolbar: () => void;
  onToggleStatusBar: () => void;
};

export default function FileBar({
  onNew,
  onSave,
  onOpen,
  onUndo,
  onRedo,
  onExportPDF,
  searchTerm,
  setSearchTerm,
  searchResults,
  currentResultIndex,
  onNextResult,
  onPrevResult,
  onToggleNavigator,

  showNavigator,
  showToolbar,
  showStatusBar,
  onToggleStatusBar,
  onToggleToolbar,
}: Props) {

// ------------------------------------------------- //

// Função para ativar/desativar barra inferior e barra flutuante
const [activeMenu, setActiveMenu] = useState<"file" | "view" | null>(null);

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
          onClick={() =>
            setActiveMenu(
              activeMenu === "file"
                ? null
                : "file"
            )
          }

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
              Novo Projeto
            </button>

            <button onClick={onOpen}>
              Abrir Projeto
            </button>

            <button onClick={onSave}>
              Salvar Projeto
            </button>

            <hr />

            <button onClick={onExportPDF}>
              Exportar PDF
            </button>

          </div>
        )}

      </div>
    
    <div className="filebar-menu">

      <button
        className="menu-button"
        onClick={() =>
          setActiveMenu(
            activeMenu === "view"
              ? null
              : "view"
          )
        }

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

        </div>
      )}
      </div>

      <button onClick={onUndo}>
        ↶ Desfazer
      </button>

      <button onClick={onRedo}>
        ↷ Refazer
      </button>


      <div className="filebar-search">
        <span className="search-icon">
          🔍
        </span>
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
          onClick={onPrevResult}
        >
          ▲
        </button>

        <button
          onClick={onNextResult}
        >
          ▼
        </button>

        <span className="search-counter">

          {searchResults.length === 0
            ? "0 / 0"
            : `${currentResultIndex + 1} / ${searchResults.length}`}

        </span>
      </div>
      

    </div>
  );
}