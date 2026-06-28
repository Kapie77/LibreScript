import "./SettingsPage.css";
import type { Settings } from "../types/settings";
// --------------------------------------------------- //

type Props = {
  settings: Settings;

  setSettings: React.Dispatch<
    React.SetStateAction<Settings>
  >;
  
};

export default function SettingsPage({
  settings,
  setSettings,
}: Props) {

  return (
    <div className="settings-page">

      <h1>⚙️ Configurações</h1>
      <div className="settings-content">

      {/* APARÊNCIA */}
      <section className="settings-section">

        <h2>🎨 Aparência</h2>

        <div className="setting-row">

          <label>Tema</label>

          <select
            value={settings.theme}
            onChange={(e) =>
              setSettings({
                ...settings,
                theme:
                  e.target.value as
                  "dark" | "light",
              })
            }
          >
            <option value="dark">
              Escuro
            </option>

            <option value="light">
              Claro
            </option>

          </select>

        </div>

      </section>

      {/* IDIOMA */}
      <section className="settings-section">

        <h2>🌎 Idioma</h2>

        <div className="setting-row">

          <label>Idioma</label>

          <select
            value={settings.language}
            onChange={(e) =>
              setSettings({
                ...settings,
                language: e.target.value,
              })
            }
          >
            <option value="pt-BR">
              Português
            </option>

            <option value="en-US">
              English
            </option>

            <option value="es-ES">
              Español
            </option>

          </select>

        </div>

      </section>

      {/* EDITOR */}
      <section className="settings-section">

        <h2>✍️ Editor</h2>

        <label className="checkbox-row">

          <input
            type="checkbox"
            checked={settings.showNavigator}
            onChange={(e) =>
              setSettings({
                ...settings,
                showNavigator: e.target.checked,
              })
            }
          />

          Mostrar painel de Cenas

        </label>

        <label className="checkbox-row">

          <input
            type="checkbox"
            checked={settings.showToolbar}
            onChange={(e) =>
              setSettings({
                ...settings,
                showToolbar: e.target.checked,
              })
            }
          />

          Mostrar barra de Ferramentas

        </label>

        <label className="checkbox-row">

          <input
            type="checkbox"
            checked={settings.showStatusBar}
            onChange={(e) =>
              setSettings({
                ...settings,
                showStatusBar: e.target.checked,
              })
            }
          />

          Mostrar barra de Status

        </label>

        <label className="checkbox-row">

          <input
            type="checkbox"
            checked={
              settings.allowDeleteBlocks
            }
            onChange={(e) =>
              setSettings({
                ...settings,
                allowDeleteBlocks:
                  e.target.checked,
              })
            }
          />

          Permitir apagar blocos

        </label>

        <label className="checkbox-row">

          <input
            type="checkbox"
            checked={
              settings.allowMoveBlocks
            }
            onChange={(e) =>
              setSettings({
                ...settings,
                allowMoveBlocks:
                  e.target.checked,
              })
            }
          />

          Permitir mover blocos

        </label>

        <label className="checkbox-row">

          <input
            type="checkbox"
            checked={
              settings.allowCollapseScenes
            }
            onChange={(e) =>
              setSettings({
                ...settings,
                allowCollapseScenes:
                  e.target.checked,
              })
            }
          />

          Permitir recolher cenas

        </label>

      </section>

      {/* INTERFACE */}
      <section className="settings-section">

        <h2>🖥 Interface</h2>

        <label className="checkbox-row">

          <input
            type="checkbox"
            checked={
              settings.showStatisticsButton
            }
            onChange={(e) =>
              setSettings({
                ...settings,
                showStatisticsButton:
                  e.target.checked,
              })
            }
          />

          Mostrar botão de Estatísticas

        </label>

        <label className="checkbox-row">

          <input
            type="checkbox"
            checked={
              settings.showHistoryButton
            }
            onChange={(e) =>
              setSettings({
                ...settings,
                showHistoryButton:
                  e.target.checked,
              })
            }
          />

          Mostrar botão de Histórico

        </label>

      </section>

    </div>
  </div>
  );
}