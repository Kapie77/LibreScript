// ----------------------- IMPORTS ----------------------------- //
import "./EditorPage.css";
import "../components/FileBar/FileBar.css";

import FileBar from "../components/FileBar/FileBar";
import { useRef } from "react";

import { exportProjectToPDF } from "../../pdf/pdfExporter";
import type { HistoryEntry } from "../../types/history";
import type { ScriptProject } from "../../types/project";
import { useNavigate } from "react-router-dom";

import "../components/StatusBar/StatusBar.css";
import "../components/ToolBar/ToolBar.css";
import type { Settings } from "../../types/settings";

import Toolbar from "../components/Toolbar/Toolbar";
import StatusBar from "../components/StatusBar/StatusBar";
import DocumentEditor from "../components/DocumentEditor/DocumentEditor";

import { useEditorDocument } from "../hooks/useEditorDocument";
import { useEngineState } from "../hooks/useEngineState";

// HOOKS //
import { useProjectFile } from "../hooks/useProjectFile";
import { useSearch } from "../hooks/useSearch";
import { useSceneNavigator } from "../hooks/useSceneNavigator";
import { useProjectHistory } from "../hooks/useActivityHistory";
import { useEditorStatistics } from "../hooks/useEditorStatistics";
import { useScrollToNewBlock } from "../hooks/useScrollToNewBlock";
import { useAddBlock } from "../hooks/useAddBlock";
import { useSelection } from "../hooks/useSelection";

// COMPONENTS DO JSX //
import SceneList from "../components/SceneList/SceneList";

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

  // FUNÇÕES //

  const fileInputRef = useRef<HTMLInputElement>(null);



  // Referência para os blocos (assim pode se guiar no menu a esquerda)
  const blockRefs = useRef<
    Record<number, HTMLDivElement | null>
  >({});

  // Navegação de páginas
  const navigate = useNavigate();


  // FUNÇÕES VIA HOOK //

  // Histórico (desfazer e refazer)
  const {
      saveHistory,
  } = useProjectHistory({
      project,
      setProject,
      setHistoryEntries,
  });

  // Engine nova
  const {

      engine,

  } = useEditorDocument({

      project,

      setProject,

  });

  const {

      blocks,

  } = useEngineState(

      engine

  );


  // Função do scroll
  const {
      lastAddedBlockId,
  } = useScrollToNewBlock({
      blocks,
      blockRefs,
  });

  // AddBlock
  const {
      addBlock,
  } = useAddBlock({
      engine,
      saveHistory,
      lastAddedBlockId,
  });

  // Função abrir/criar/salvar projeto e handle open file
  const {
      openProject,
      newProject,
      saveProject,
      handleFileOpen,
  } = useProjectFile({
      project,
      setProject,
      saveHistory,
      fileInputRef,
  });

  // Função do buscador
  const {
      searchTerm,
      setSearchTerm,
      searchResults,
      currentResultIndex,
      nextSearchResult,
      prevSearchResult,
  } = useSearch({
      engine,
      blockRefs,
  });

  // Funções de todas as lógicas da cena
  const {
      scenes,
      activeSceneId,
      collapsedScenes,
      toggleScene,
      getSceneBlockCount,
      isBlockHidden,
      goToScene,
  } = useSceneNavigator({
      blocks,
      blockRefs,
  });

  // Função das estatisticas
  const {
      stats,
      wordCount,
      charCount,
  } = useEditorStatistics(
      blocks
  );

  // mostrar/esconder painel de navegar entre cenas
  const showNavigator = settings.showNavigator;

  // ativar/desativar barra inferior e barra flutuante no menu "view"
  const showToolbar = settings.showToolbar;
  const showStatusBar = settings.showStatusBar;

  // Texto selecionado
  const {
      selectedText,
  } = useSelection();

// ================================================== //
  return (
    <div className="editor-layout">

        {/*BOTÕES DO MENU SUPERIOR*/}
        <FileBar
          onUndo={() => engine.undo()}
          onRedo={() => engine.redo()}
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
    <SceneList
        showNavigator={showNavigator}
        scenes={scenes}
        activeSceneId={activeSceneId}
        collapsedScenes={collapsedScenes}
        goToScene={goToScene}
        toggleScene={toggleScene}
        getSceneBlockCount={getSceneBlockCount}
    />
    {/*FIM DO CENAS*/}

    <div className="editor-area">
     {showToolbar && (
        <Toolbar 
        onAddBlock={addBlock}
        />
      )}

      {/*Editor canvas*/}
      <DocumentEditor engine={engine} />
      {/*Editor canvas*/}
      

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
              pageCount={1}
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