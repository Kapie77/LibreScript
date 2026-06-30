type Props = {
  pageCount: number;
  wordCount: number;
  charCount: number;

  onHistory: () => void;
  onStatistics: () => void;
};

export default function StatusBar({
  pageCount,
  wordCount,
  charCount,
  onHistory,
  onStatistics,
}: Props) {

  return (

    <div className="statusbar">

    <div className="statusbar-left">

      <span>
        📄 {pageCount} páginas
      </span>

      <span>
        📝 {wordCount} palavras
      </span>

      <span>
        🔤 {charCount} caracteres
      </span>

    </div>

    <div className="statusbar-right">

      <button onClick={onHistory}>
        🕒 Histórico
      </button>

      <button onClick={onStatistics}>
        📊 Estatísticas
      </button>

    </div>

  </div>

  );
}