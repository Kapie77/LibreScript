// App.tsx
// src/
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

  // =========================================================
  // HISTÓRICO
  // =========================================================
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);


  // =========================================================
  // PROJETO
  // =========================================================

  const [project, setProject] =
      useState<ScriptProject>(() => ({
        
          title: "",
          author: "",
          blocks:
              structuredClone(
                  sampleScript
              ),
          titlePage: {
              enabled: false,
              title: "",
              primaryCredit: {

                  type: "written-by",
                  name: "",

              },
              storyBy: "",
              subtitle: "",
              basedOn: "",
              basedOnBy: "",
              draft: "",
              draftPosition: "center",
              date: "",
              copyright: "",
              datePosition: "center",
              contact: {
                  address: "",
                  phone: "",
                  email: "",
              },
          },

      }));

    // =========================================================
    // CONFIGURAÇÕES
    // =========================================================
    const [settings, setSettings] =
        useState(() => {

            const saved =
                localStorage.getItem(
                    "librescript-settings"
                );

            if (saved) {

                return JSON.parse(
                    saved
                );

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
                pageNumberPosition: "top-right",
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