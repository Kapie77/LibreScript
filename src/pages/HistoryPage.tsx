import type { HistoryEntry } from "../types/history";
import type { ScriptProject } from "../types/project";
import "./HistoryPage.css";

type Props = {
  history: HistoryEntry[];
  onClear: () => void;
  onRestore: (snapshot: ScriptProject) => void;
};

export default function HistoryPage({
  history,
  onClear,
  onRestore,
}: Props) {

  return (
    <div className="page-container">

      <div className="history-header-area">
      
        <div className="history-header">

          <div>
            <h1>🕒 Histórico</h1>

            <p>
              {history.length} eventos registrados
            </p>
          </div>

        </div>

        <button
          className="clear-history"
          onClick={() => {
              const confirmed = window.confirm(
              "Deseja realmente apagar todo o histórico?"
              );

              if (!confirmed) return;

              onClear();
          }}
          >
          🗑 Limpar Histórico
        </button>

       </div>

    <div className="history-list">

      {history.length === 0 ? (
        <p>Nenhum evento registrado.</p>
      ) : (
        history
          .slice()
          .reverse()
          .map((entry) => {

            const icon =
              entry.action.includes("restaurado")
                ? "🟡"
                : entry.action.includes("criado")
                ? "🟢"
                : entry.action.includes("excluído")
                ? "🔴"
                : entry.action.includes("movido")
                ? "🔵"
                : "⚪";

            return (
                <div
                  key={entry.id}
                  className={`history-item ${
                    entry.action.includes("criado")
                      ? "history-created"
                      : entry.action.includes("excluído")
                      ? "history-deleted"
                      : entry.action.includes("movido")
                      ? "history-moved"
                      : entry.action.includes("restaurado")
                      ? "history-restored"
                      : ""
                  }`}
                >

              <div className="history-top">
                <strong>
                  {icon} {entry.action}
                </strong>

                <button
                  className="restore-button"
                  onClick={() =>
                    onRestore(entry.snapshot)
                  }
                >
                  ↩ Reverter
                </button>
              </div>

              {entry.details && (
                <div className="history-details">
                  {entry.details}
                </div>
              )}

              <div className="history-date">
                {new Date(
                  entry.timestamp
                ).toLocaleString()}
              </div>

            </div>
          );
        })
      )}

    </div>
  </div>
  );
}