// App.tsx
// src/
import "./App.css";
import { Routes, Route, Link } from "react-router-dom";
import EditorPage from "./editor/pages/EditorPage";
import GuidePage from "./editor/pages/Guide/GuidePage";
import RepositoryPage from "./editor/pages/Repository/RepositoryPage";
import { useState, useEffect, useRef } from "react";

import type { HistoryEntry } from "./types/history";
import type { ScriptProject } from "./types/project";
import { sampleScript } from "./data/sampleScript";

import StatisticsPage from "./editor/pages/Statistics/StatisticsPage";
import SettingsPage from "./editor/pages/Settings/SettingsPage";
import HistoryPage from "./editor/pages/History/HistoryPage";
import { EditorEngine } from "./editor/engine/EditorEngine";
// --------------------------------------------------------- //

function App() {

  // =========================================================
  // ENGINE
  // =========================================================

  const engineRef =
      useRef<EditorEngine | null>(null);

  if (engineRef.current === null) {

      engineRef.current =
          new EditorEngine();

  }

  const engine =
      engineRef.current;

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
          format: "film",
          series: {
              episodeNumber: "",
              episodeTitle: "",
          },
          blocks:
              structuredClone(
                  sampleScript
              ),
          titlePage: {
              enabled: false,
              visualMode: "text",
              imagePath: "",
              title: "",
              primaryCredit: {

                  type: "written-by",
                  name: "",

              },
              storyBy: "",
              directedBy: "",
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
    // CARREGAR DOCUMENTO INICIAL
    // =========================================================

    useEffect(() => {
        engine.loadDocument(project.blocks);
    }, []);

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
                engine={engine}
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