// ----------------------- IMPORTS ----------------------------- //
import "./EditorPage.css";
import "../components/FileBar.css";
import Toolbar from "../components/Toolbar";
import ScriptBlock from "../components/ScriptBlock";
import FileBar from "../components/FileBar";
import { useEffect, useRef, useState, } from "react";
import { sampleScript } from "../data/sampleScript";
import { exportProjectToPDF } from "../utils/pdfExporter";


import type { HistoryEntry } from "../types/history";
import type { ScriptProject } from "../types/project";
import { useNavigate } from "react-router-dom";

import StatusBar from "../components/StatusBar";
import "../components/StatusBar.css";
import "../components/ToolBar.css";
import type { Settings } from "../types/settings";

import type { MeasurementMap } from "../layout/types";

import { usePagination } from "../hooks/usePagination";

import { getBlockLayout } from "../layout/ScriptBlockLayout";
// ------------------------------------------------------------- //

type Props = {
   project: ScriptProject;

  setProject: React.Dispatch<
    React.SetStateAction<ScriptProject>
  >;

  historyEntries: HistoryEntry[];

  setHistoryEntries: React.Dispatch<
    React.SetStateAction<HistoryEntry[]>
  >;

  settings: Settings;

  setSettings: React.Dispatch<
    React.SetStateAction<Settings>
  >;
};

export default function EditorPage({
  project,
  setProject,
  historyEntries,
  setHistoryEntries,
  settings,
  setSettings,
}: Props) {

  // FUNÇÕES

    // Desfazer e Refazer
    const [undoStack, setUndoStack] = useState<ScriptProject[]>([]);
    const [redoStack, setRedoStack] = useState<ScriptProject[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Referência para os blocos (assim pode se guiar no menu a esquerda)
    const blockRefs = useRef<
      Record<number, HTMLDivElement | null>
    >({});

      // Cena ativa
      const [activeSceneId, setActiveSceneId] = useState<number | null>(null);

      // Navegação de páginas
      const navigate = useNavigate();

    // Função para salvar estado (para o desfazer e refazer)
    const saveHistory = (
      action: string,
      details?: string
    ) => {
      setUndoStack((prev) => [
        ...prev,
        structuredClone(project),
      ]);

      const entry: HistoryEntry = {
        id: Date.now(),
        timestamp: Date.now(),
        action,
        details,
        snapshot: structuredClone(project),
      };

      setHistoryEntries((prev) => [
        ...prev,
        entry,
      ]);

      setRedoStack([]);
    };

      // Desfazer/Undo
      const undo = () => {
        if (undoStack.length === 0) return;

        const previous =
          undoStack[undoStack.length - 1];

        setRedoStack((prev) => [
          ...prev,
          structuredClone(project),
        ]);

        setUndoStack((prev) =>
          prev.slice(0, -1)
        );

        setProject(previous);
      };

      // Refazer/Redo
      const redo = () => {
        if (redoStack.length === 0) return;

        const next =
          redoStack[redoStack.length - 1];

        setUndoStack((prev) => [
          ...prev,
          structuredClone(project),
        ]);

        setRedoStack((prev) =>
          prev.slice(0, -1)
        );

        setProject(next);
      };

  const addBlock = (
    type: string,
    customContent?: string
  ) => {

    const templates = {
      scene: "INT. NEW SCENE - DAY",
      action: "New action.",

      character: "CHARACTER",
      character_contd: "CHARACTER (CONT'D)",
      character_os: "CHARACTER (O.S.)",
      character_vo: "CHARACTER (V.O.)",

      dialogue: "New dialogue.",
      parenthetical: "(whispering)",
      shot: "CLOSE UP:",
      transition: "CUT TO:"
    };

    const newBlock = {
      id: Date.now(),
      type: type as any,
      content:
        customContent ??
        templates[
          type as keyof typeof templates
        ]
    };

    // guarda qual foi o último bloco criado
    lastAddedBlockId.current = newBlock.id;

    saveHistory(
      "Bloco criado",
      newBlock.content
    );

    setProject({
      ...project,
      blocks: [...project.blocks, newBlock],
    });

  };

  //Função de Atualização
  const updateBlock = (
    id: number,
    content: string
  ) => {

    const block =
      project.blocks.find(
        (b) => b.id === id
      );

    if (!block) return;

    const layout = getBlockLayout(block);

    const finalContent =
      layout.editor.uppercase
        ? content.toUpperCase()
        : content;

    setProject({
      ...project,
      blocks: project.blocks.map((b) =>
        b.id === id
          ? {
              ...b,
              content: finalContent,
            }
          : b
      ),
    });

  };

  // Função criar novo projeto
  const newProject = () => {
    const confirmed = window.confirm(
      "Deseja criar um novo projeto? Alterações não salvas serão perdidas."
    );

    if (!confirmed) return;
    saveHistory("Novo projeto");

    setProject({
      title: "",
      author: "",
      blocks: [],
    });
  };

  // Função salvar novo projeto
  const saveProject = () => {
    const data = JSON.stringify(
      project,
      null,
      2
    );

    const blob = new Blob(
      [data],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    const fileName =
      project.title.trim() || "Projeto";

    link.href = url;
    link.download = `${fileName}.lscript`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // Função abrir projeto
  const openProject = () => {
    fileInputRef.current?.click();
  };

    // Função criar o leitor de arquivo
    const handleFileOpen = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = event.target.files?.[0];

      if (!file) return;

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;

          const loadedProject = JSON.parse(content);
          saveHistory("Projeto aberto");

          setProject(loadedProject);
        } catch {
          alert("Arquivo inválido.");
        }
      };

      reader.readAsText(file);
    };

  // Gerar bloco automaticamente de cena
  const scenes = project.blocks.filter(
    (block) => block.type === "scene"
  );

  // Função de apagar bloco
  const deleteBlock = (id: number) => {
    const block = project.blocks.find(
      (block) => block.id === id
    );

    if (!block) return;

    const confirmed = window.confirm(
      `Deseja realmente excluir:\n\n"${block.content}"?`
    );

    if (!confirmed) return;
    saveHistory(
      "Bloco excluído",
      block.content
    );

    setProject({
      ...project,
      blocks: project.blocks.filter(
        (block) => block.id !== id
      ),
    });
  };

  // Função para mover blocos
    // Mover para cima
    const moveBlockUp = (id: number) => {
      const index = project.blocks.findIndex(
        (block) => block.id === id
      );

      if (index <= 0) return;

      const block = project.blocks[index];

      saveHistory(
        "Bloco movido para cima",
        block.content
      );

      const blocks = [...project.blocks];

      [blocks[index - 1], blocks[index]] =
        [blocks[index], blocks[index - 1]];

      setProject({
        ...project,
        blocks,
      });
    };

    // Mover para baixo
    const moveBlockDown = (id: number) => {
      const index = project.blocks.findIndex(
        (block) => block.id === id
      );

      if (
        index === -1 ||
        index >= project.blocks.length - 1
      ) {
        return;
      }

      const block = project.blocks[index];

      saveHistory(
        "Bloco movido para baixo",
        block.content
      );

      const blocks = [...project.blocks];

      [blocks[index], blocks[index + 1]] =
        [blocks[index + 1], blocks[index]];

      setProject({
        ...project,
        blocks,
      });
    };

    // UseEffect da cena ativa/atual
    useEffect(() => {

        const handleScroll = () => {

          let currentScene: number | null = null;

          scenes.forEach((scene) => {

            const element =
              blockRefs.current[scene.id];

            if (!element) return;

            const rect =
              element.getBoundingClientRect();

            if (
              rect.top >= 0 &&
              rect.top <= window.innerHeight / 2
            ) {
              currentScene = scene.id;
            }

          });

          if (currentScene !== null) {
            setActiveSceneId(currentScene);
          }

        };

      }, [scenes]);

      // Bloco de cenas organizados
      const getSceneBlockCount = (
        sceneId: number
      ) => {

        const sceneIndex =
          project.blocks.findIndex(
            (block) => block.id === sceneId
          );

        if (sceneIndex === -1) return 0;

        let count = 0;

        for (
          let i = sceneIndex + 1;
          i < project.blocks.length;
          i++
        ) {

          if (
            project.blocks[i].type === "scene"
          ) {
            break;
          }

          count++;
        }

        return count;
      };

  // Expandir/recolher cenas
  const [collapsedScenes, setCollapsedScenes] = useState<number[]>([]);

      // UseEffect, cenas começam recolhidas
      useEffect(() => {

        setCollapsedScenes(
          scenes.map(scene => scene.id)
        );

      }, []);
      
      // Função de alternância
      const toggleScene = (sceneId: number) => {

        setCollapsedScenes((prev) =>

          prev.includes(sceneId)
            ? prev.filter((id) => id !== sceneId)
            : [...prev, sceneId]

        );

      };

      // Esconder os blocos da cena recolhida
      const isBlockHidden = (
        blockIndex: number
      ) => {

        let currentSceneId: number | null = null;

        for (
          let i = 0;
          i <= blockIndex;
          i++
        ) {

          const block = project.blocks[i];

          if (block.type === "scene") {
            currentSceneId = block.id;
          }

        }

        return (
          currentSceneId !== null &&
          collapsedScenes.includes(currentSceneId)
        );

      };
  
  // Buscador (Ctrl + F)
  const [searchTerm, setSearchTerm] = useState("");

  const [searchResults, setSearchResults] =
  useState<number[]>([]);

  const [currentResultIndex, setCurrentResultIndex] =
    useState(0);

      // Rolar ao pesquisar por termo
      useEffect(() => {

        if (!searchTerm.trim()) {

          setSearchResults([]);
          setCurrentResultIndex(0);

          return;
        }

        const results =
          project.blocks
            .filter(block =>
              block.content
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            )
            .map(block => block.id);

        setSearchResults(results);

        setCurrentResultIndex(0);

        if (results.length > 0) {

          const element =
            blockRefs.current[results[0]];

          element?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

        }

      }, [searchTerm, project.blocks]);

          // Função para navegar entre pesquisas
          const goToSearchResult = (
            index: number
          ) => {

            if (
              searchResults.length === 0
            ) return;

            const blockId =
              searchResults[index];

            const element =
              blockRefs.current[blockId];

            element?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          };
            // Próximo resultado
            const nextSearchResult = () => {

              if (
                searchResults.length === 0
              ) return;

              const next =
                (currentResultIndex + 1)
                % searchResults.length;

              setCurrentResultIndex(next);

              goToSearchResult(next);
            };
            // Resultado anterior
            const prevSearchResult = () => {

              if (
                searchResults.length === 0
              ) return;

              const prev =
                currentResultIndex === 0
                  ? searchResults.length - 1
                  : currentResultIndex - 1;

              setCurrentResultIndex(prev);

              goToSearchResult(prev);
            };

      // Estatisticas:
      const stats = {
        scenes: project.blocks.filter(
          (b) => b.type === "scene"
        ).length,

        actions: project.blocks.filter(
          (b) => b.type === "action"
        ).length,

        characters: project.blocks.filter(
          (b) => b.type === "character"
        ).length,

        dialogues: project.blocks.filter(
          (b) => b.type === "dialogue"
        ).length,

        transitions: project.blocks.filter(
          (b) => b.type === "transition"
        ).length,

        total: project.blocks.length,
      };

        // Cria estado das páginas
        const {
          pages,
        } = usePagination(project.blocks);

        // Contador de palavras e páginas
        const wordCount =
          project.blocks
            .map((b) => b.content)
            .join(" ")
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .length;

        const charCount =
          project.blocks
            .map((b) => b.content)
            .join("")
            .length;

        const pageCount =
          pages.length;

      // Referência paras os botões de ações rolarem
      const lastAddedBlockId = useRef<number | null>(null);

        //UseEffect para os botões de ações rolarem ao clicar
        useEffect(() => {

          if (!lastAddedBlockId.current) return;

          const element =
            blockRefs.current[
              lastAddedBlockId.current
            ];

          if (!element) return;

          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          lastAddedBlockId.current = null;

        }, [project.blocks]);

        // mostrar/esconder painel de navegar entre cenas
        const showNavigator = settings.showNavigator;

        // ativar/desativar barra inferior e barra flutuante no menu "view"
        const showToolbar = settings.showToolbar;
        const showStatusBar = settings.showStatusBar;

        // Função ir para cena
        const goToScene = (id: number) => {
          const element = blockRefs.current[id];

          if (!element) return;

          setActiveSceneId(id);

          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        };

// ================================================== //
  return (
    <div className="editor-layout">

        {/*BOTÕES DO MENU SUPERIOR*/}
        <FileBar
          onUndo={undo}
          onRedo={redo}
          onNew={newProject}
          onSave={saveProject}
          onOpen={openProject}
          onExportPDF={() =>
            exportProjectToPDF(project)
          }

          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchResults={searchResults}
          currentResultIndex={currentResultIndex}
          onNextResult={nextSearchResult}
          onPrevResult={prevSearchResult}

          showNavigator={showNavigator}
          showToolbar={showToolbar}
          showStatusBar={showStatusBar}

          onToggleNavigator={() =>
            setSettings({
              ...settings,
              showNavigator: !settings.showNavigator,
            })
          }

          onToggleToolbar={() =>
            setSettings({
              ...settings,
              showToolbar: !settings.showToolbar,
            })
          }

          onToggleStatusBar={() =>
            setSettings({
              ...settings,
              showStatusBar: !settings.showStatusBar,
            })
          }
        />
        
        
        {/*TITULO E AUTOR*
        <div className="project-header">
          <input
            className="project-title"
            placeholder="Título do Projeto"
            value={project.title}
            onChange={(e) =>
              setProject({
                ...project,
                title: e.target.value,
              })
            }
          />

          <input
            className="project-author"
            placeholder="Autor"
            value={project.author}
            onChange={(e) =>
              setProject({
                ...project,
                author: e.target.value,
              })
            }
          />
        </div>
        */}

    {/* SIDEBAR NAVEGAR ENTRE CENAS */}
      {showNavigator && (
      <div className="scene-list">
        <h3>Cenas</h3>

        {scenes.map((scene, index) => (
          <div
            key={scene.id}
            className={
              activeSceneId === scene.id
                ? "scene-item active"
                : "scene-item"
            }
          >

            <div
              className="scene-header"
              onClick={() => goToScene(scene.id)}
            >
              <strong>
                Cena {index + 1}
              </strong>

              <div className="scene-title">
                {scene.content}
              </div>

              <small>
                {collapsedScenes.includes(scene.id)
                  ? `${getSceneBlockCount(scene.id)} ocultos`
                  : `${getSceneBlockCount(scene.id)} blocos`
                }
              </small>
            </div>

            <button
              className="collapse-btn"
              onClick={() => toggleScene(scene.id)}
            >
              {collapsedScenes.includes(scene.id)
                ? "▶"
                : "▼"}
            </button>

          </div>
          ))}

      </div>
      )}
    {/*FIM DO CENAS*/}

    <div className="editor-area">
     {showToolbar && (
        <Toolbar onAddBlock={addBlock} />
      )}

        <div className="pages-container">

          {pages.map(
            (page, pageIndex) => (

              <div
                key={pageIndex}
                className="script-page"
              >

                {page.map((block) => {

                  const isMatch =
                    searchTerm.trim() !== "" &&
                    block.content
                      .toLowerCase()
                      .includes(
                        searchTerm.toLowerCase()
                      );

                  return (
                    <div
                      key={block.id}
                      className={
                        isMatch
                          ? "search-match"
                          : ""
                      }
                      ref={(el) => {

                        blockRefs.current[
                          block.id
                        ] = el;

                      }}
                    >
                      <ScriptBlock
                        block={block}
                        onChange={updateBlock}
                        onDelete={deleteBlock}
                        onMoveUp={moveBlockUp}
                        onMoveDown={moveBlockDown}
                        searchTerm={searchTerm}
                      />
                    </div>
                  );

                })}

                <div className="page-number">
                  {pageIndex + 1}
                </div>

              </div>

            )
          )}

        </div>
      

        <input
          type="file"
          accept=".lscript"
          ref={fileInputRef}
          onChange={handleFileOpen}
          style={{ display: "none" }}
        />

        {/* Painel Flutuante para Histórico e Estátisticas */}
        {showStatusBar && (
          <StatusBar
            pageCount={pageCount}
            wordCount={wordCount}
            charCount={charCount}
            onHistory={() => navigate("/history")}
            onStatistics={() => navigate("/statistics")}
          />
        )}

        </div>

    </div>

  );
}