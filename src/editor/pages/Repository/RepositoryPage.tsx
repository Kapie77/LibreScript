import "./RepositoryPage.css";

export default function RepositoryPage() {
  return (
    <div className="repository-page">

      <div className="repository-card">

        <h1>📦 LibreScript</h1>

        <p className="repository-description">
          Editor de roteiros cinematográficos open-source,
          desenvolvido com React e TypeScript.
        </p>

        <div className="repository-info">

          <div>
            <strong>Versão</strong>
            <span>0.4 Alpha</span>
          </div>

          <div>
            <strong>Tecnologias</strong>
            <span>React • TypeScript • jsPDF</span>
          </div>

          <div>
            <strong>Licença</strong>
            <span>MIT</span>
          </div>

        </div>

        <a
          className="github-button"
          href="https://github.com/Kapie77/LibreScript"
          target="_blank"
          rel="noreferrer"
        >
          🌐 Abrir GitHub
        </a>

      </div>

    </div>
  );
}