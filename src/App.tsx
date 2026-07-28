import "./App.css";
import { Routes, Route, Link } from "react-router-dom";
import EditorPage from "./editor/pages/EditorPage";
import GuidePage from "./editor/pages/Guide/GuidePage";
import RepositoryPage from "./editor/pages/Repository/RepositoryPage";
import { useState, useEffect } from "react";

import type { HistoryEntry } from "./types/history";
import type { ScriptProject } from "./types/project";
import { sampleScript } from "./data/sampleScript";

import StatisticsPage from "./editor/pages/Statistics/StatisticsPage";
import SettingsPage from "./editor/pages/Settings/SettingsPage";
import HistoryPage from "./editor/pages/History/HistoryPage";
// --------------------------------------------------------- //

function App() {
  
  // Função de historico
  const [historyEntries, setHistoryEntries] =
    useState<HistoryEntry[]>(() => {

      const saved =
        localStorage.getItem(
          "librescript-history"
        );

      if (saved) {
        return JSON.parse(saved);
      }

      return [];

    });

      // Salvar historico no localStorage
      useEffect(() => {

        localStorage.setItem(
          "librescript-history",
          JSON.stringify(historyEntries)
        );

      }, [historyEntries]);

  // Base do projeto
  const [project, setProject] =
    useState<ScriptProject>(() => {

      const saved =
        localStorage.getItem(
          "librescript-project"
        );

      if (saved) {
        return JSON.parse(saved);
      }

      return {
        title: "",
        author: "",
        blocks: sampleScript,
      };

    });

      // Salvar projeto no localStorage
      useEffect(() => {

        localStorage.setItem(
          "librescript-project",
          JSON.stringify(project)
        );

      }, [project]);

        //Salvar configurações no localStorage
          const [settings, setSettings] =
            useState(() => {

              const saved =
                localStorage.getItem(
                  "librescript-settings"
                );

              if (saved) {
                return JSON.parse(saved);
              }

              return {
                theme: "light",
                language: "pt-BR",

                allowDeleteBlocks: true,
                allowMoveBlocks: true,
                allowCollapseScenes: true,

                showStatisticsButton: true,
                showHistoryButton: true,

                showNavigator: false,
                showToolbar: true,
                showStatusBar: true,
              };

            });

              //UseEffects para salvar configuração no localStorage
              useEffect(() => {

                localStorage.setItem(
                  "librescript-settings",
                  JSON.stringify(settings)
                );

              }, [settings]);

              // UseEffect para troca de tema
              useEffect(() => {

                document.documentElement.setAttribute(
                  "data-theme",
                  settings.theme
                );

              }, [settings.theme]);

// ------------------------------------------------------------- //
  return (
    <div className="app">

      {/* MENU */}
      <header className="topbar">

        <h1>LibreScript</h1>

        <nav>
          <Link to="/">✍️ Editor</Link>
          <Link to="/guide">📖 Guia</Link>
          <Link to="/repository">📦 Repositório</Link>
          <Link to="/settings">⚙️ Configurações</Link>
        </nav>

        <button
          className="theme-toggle"
          onClick={() =>
            setSettings({
              ...settings,
              theme:
                settings.theme === "dark"
                  ? "light"
                  : "dark",
            })
          }
        >
          {settings.theme === "dark"
            ? "☀️"
            : "🌙"}
        </button>

      </header>
      {/* FIM DO MENU */}

      <main className="content">
        <Routes>

          <Route
            path="/"
            element={
              <EditorPage
                project={project}
                setProject={setProject}
                historyEntries={historyEntries}
                setHistoryEntries={setHistoryEntries}
                settings={settings}
                setSettings={setSettings}
              />
            }
          />

          <Route
            path="/history"
            element={
              <HistoryPage
                history={historyEntries}
                onClear={() =>
                  setHistoryEntries([])
                }
                onRestore={(snapshot) => {

                  const currentProject =
                    structuredClone(project);

                  setProject(snapshot);

                  setHistoryEntries(prev => [
                    ...prev,
                    {
                      id: Date.now(),
                      timestamp: Date.now(),
                      action: "Bloco restaurado",
                      details:
                        snapshot.blocks[0]?.content ||
                        "Sem conteúdo",
                      snapshot: currentProject,
                    }
                  ]);

                }}
              />
            }
          />

          <Route
            path="/statistics"
            element={
              <StatisticsPage
                project={project}
              />
            }
          />

          <Route path="/guide" element={<GuidePage />} />
          <Route path="/repository" element={<RepositoryPage />} />

          <Route
            path="/settings"
            element={
              <SettingsPage
                settings={settings}
                setSettings={setSettings}
              />
            }
          />

        </Routes>
      </main>
    </div>
  );
}

export default App;