// StatusBar.tsx
// src/editor/components/StatusBar/

type Props = {
  pageCount: number;
  wordCount: number;
  charCount: number;

  zoom: number;
  onZoomChange: (zoom: number) => void;

  onHistory: () => void;
  onStatistics: () => void;
};

export default function StatusBar({
  pageCount,
  wordCount,
  charCount,
  zoom,
  onZoomChange,
  onHistory,
  onStatistics,
}: Props) {

  return (

    <div className="statusbar">

    <div className="statusbar-left">

      <span>
          📄 {pageCount} {pageCount === 1 ? "página" : "páginas"}
      </span>

      <span>
        📝 {wordCount} palavras
      </span>

      <span>
        🔤 {charCount} caracteres
      </span>

    </div>

    <div className="statusbar-right">

      {/*HISTÓRICO*/}
      <button onClick={onHistory}>
        🕒 Histórico
      </button>
      {/*FIM DO HISTÓRICO*/}

      {/*ESTATÍSTICAS*/}
      <button onClick={onStatistics}>
        📊 Estatísticas
      </button>
      {/*FIM DAS ESTATÍSTICAS*/}

      {/*ZOOM*/}
      <div className="statusbar-zoom">

        <button
          type="button"
          title="Diminuir zoom"
          disabled={zoom <= 50}
          onClick={() =>
            onZoomChange(Math.max(50, zoom - 10))
          }
        >
          −
        </button>

        <span className="statusbar-zoom-value">
          {zoom}%
        </span>

        <button
          type="button"
          title="Aumentar zoom"
          disabled={zoom >= 200}
          onClick={() =>
            onZoomChange(Math.min(200, zoom + 10))
          }
        >
          +
        </button>

      </div>
      {/*FIM DO ZOOM*/}

    </div>

  </div>

  );
}