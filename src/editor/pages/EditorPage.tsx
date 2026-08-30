// EditorPage.tsx
// src/editor/pages/
// ----------------------- IMPORTS ----------------------------- //
import "./EditorPage.css";
import "../components/FileBar/FileBar.css";

import FileBar from "../components/FileBar/FileBar";
import { useRef, useEffect, useState } from "react";

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
import { getCurrentWindow } from "@tauri-apps/api/window";

// HOOKS //
import { useProjectFile } from "../hooks/useProjectFile";
import { useSearch } from "../hooks/useSearch";
import { useSceneNavigator } from "../hooks/useSceneNavigator";
import { useProjectHistory } from "../hooks/useActivityHistory";
import { useEditorStatistics } from "../hooks/useEditorStatistics";
import { useScrollToNewBlock } from "../hooks/useScrollToNewBlock";

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

  // isDirty
  // (alterações que não foram salvas no arquivo)
  const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {

      engine.setDirtyHandler(
          () => {

              setIsDirty(true);

          }
      );

      return () => {

          engine.setDirtyHandler(
              () => {}

          );

      };

  }, [engine]);

  // filePath
  // (mostra o arquivo que está sendo editado)
  const [filePath, setFilePath] = useState<string | null>(null);

  const {
      blocks,
  } = useEngineState(
      engine
  );

  const pageCount = engine.getPageCount();


  // Função do scroll
  const {
      lastAddedBlockId,
  } = useScrollToNewBlock({
      blocks,
      blockRefs,
  });

  // Função abrir/criar/salvar projeto e handle open file
  const {
      openProject,
      newProject,
      saveProject,
      saveProjectAs,
  } = useProjectFile({

      engine,
      project,
      setProject,
      saveHistory,

      onSaved: () => {
        setIsDirty(false);
      },

      setFilePath,
  });

  //useEffect do saveHandler
      useEffect(() => {

        engine.setSaveHandler(
            () => {
                void saveProject();
            }
        );

        return () => {

            engine.setSaveHandler(
                () => {}
            );

        };

    }, [
        engine,
        saveProject
    ]);
  
  // mostra o nome do arquivo na barra do programa
  // mostra a bolinha quando tem edição não-salva
  useEffect(() => {

      const windowTitle =
          filePath
              ? filePath.split("\\").pop() || "Projeto sem nome"
              : "Projeto sem nome";

      const title =
          isDirty
              ? `LibreScript — ${windowTitle} *`
              : `LibreScript — ${windowTitle}`;

      void getCurrentWindow().setTitle(title);

  }, [filePath, isDirty]);

  // Função do buscador
  const {
      searchTerm,
      setSearchTerm,

      replaceTerm,
      setReplaceTerm,

      caseSensitive,
      setCaseSensitive,

      ignoreAccents,
      setIgnoreAccents,

      searchResults,
      currentResultIndex,

      nextSearchResult,
      prevSearchResult,

  } = useSearch({
      engine,
      blocks,
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
          onSaveAs={saveProjectAs}
          onOpen={openProject}
          onExportPDF={() => {
                void exportProjectToPDF(project);
          }}

          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          replaceTerm={replaceTerm}
          setReplaceTerm={setReplaceTerm}
          searchResults={searchResults}
          currentResultIndex={currentResultIndex}
          onNextResult={nextSearchResult}
          onPrevResult={prevSearchResult}

          onReplace={() => {
            if (!searchTerm.trim()) {
                return;
            }

            if (searchResults.length === 0) {
                return;
            }

            const currentResult =
                searchResults[currentResultIndex];

            if (currentResult === undefined) {

                return;

            }

            engine.replaceCurrentSearchResult(

                currentResult.paragraphId,

                searchTerm,

                replaceTerm,

                caseSensitive,

                ignoreAccents,

                currentResult.occurrenceIndex

            );

        }}

          onReplaceAll={() => {
              if (!searchTerm.trim()) {
                  return;
              }
              engine.execute({
                  type: "REPLACE_ALL",
                  term: searchTerm,
                  replacement: replaceTerm,
                  caseSensitive,
                  ignoreAccents,
              });
          }}

          caseSensitive={caseSensitive}
          setCaseSensitive={setCaseSensitive}

          ignoreAccents={ignoreAccents}
          setIgnoreAccents={setIgnoreAccents}

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

          allowMoveBlocks={settings.allowMoveBlocks}
          allowDeleteBlocks={settings.allowDeleteBlocks}

          onToggleMoveBlocks={() =>
            setSettings(prev => ({
              ...prev,
              allowMoveBlocks: !prev.allowMoveBlocks,
            }))
          }

          onToggleDeleteBlocks={() =>
            setSettings(prev => ({
              ...prev,
              allowDeleteBlocks: !prev.allowDeleteBlocks,
            }))
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
              engine={engine}
          />
      )}

      {/*Editor canvas*/}
      <DocumentEditor
          engine={engine}
          allowMoveBlocks={settings.allowMoveBlocks}
          allowDeleteBlocks={settings.allowDeleteBlocks}
          onSave={saveProject}
          onOpen={openProject}
      />
      {/*Editor canvas*/}


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