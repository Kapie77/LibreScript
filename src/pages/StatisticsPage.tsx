import type { ScriptProject } from "../types/project";
import "./StatisticsPage.css";
// --------------------------------------------------------/

type Props = {
  project: ScriptProject;
};

export default function StatisticsPage({
  project,
}: Props) {

  const totalScenes =
    project.blocks.filter(
      (b) => b.type === "scene"
    ).length;

  const totalActions =
    project.blocks.filter(
      (b) => b.type === "action"
    ).length;

  const totalCharacters =
    project.blocks.filter(
      (b) => b.type === "character"
    ).length;

  const totalDialogues =
    project.blocks.filter(
      (b) => b.type === "dialogue"
    ).length;

  const totalTransitions =
    project.blocks.filter(
      (b) => b.type === "transition"
    ).length;

  const totalParentheticals =
    project.blocks.filter(
      (b) => b.type === "parenthetical"
    ).length;

  const totalShots =
    project.blocks.filter(
      (b) => b.type === "shot"
    ).length;

  const totalWords =
    project.blocks
      .map((b) => b.content)
      .join(" ")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

  const totalCharactersText =
    project.blocks
      .map((b) => b.content)
      .join("")
      .length;

  // Ranking falas de personagens
  const characterStats: Record<
    string,
    number
    > = {};

    for (
    let i = 0;
    i < project.blocks.length;
    i++
    ) {

    const block =
        project.blocks[i];

    if (block.type !== "character") {
        continue;
    }

    const name =
        block.content.trim().toUpperCase();

    characterStats[name] =
        (characterStats[name] || 0) + 1;
    }

    const rankedCharacters =
    Object.entries(characterStats)
        .sort((a, b) => b[1] - a[1]);

// ------------------------------------------ //
  return (
  <div className="statistics-page">

    <h1>📊 Estatísticas</h1>

    <div className="stats-grid">

      <div className="stat-card">
        <h3>Total de Blocos</h3>
        <div className="stat-value">
          {project.blocks.length}
        </div>
      </div>

      <div className="stat-card">
        <h3>Cenas</h3>
        <div className="stat-value">
          {totalScenes}
        </div>
      </div>

      <div className="stat-card">
        <h3>Ações</h3>
        <div className="stat-value">
          {totalActions}
        </div>
      </div>

      <div className="stat-card">
        <h3>Personagens</h3>
        <div className="stat-value">
          {totalCharacters}
        </div>
      </div>

      <div className="stat-card">
        <h3>Diálogos</h3>
        <div className="stat-value">
          {totalDialogues}
        </div>
      </div>

      <div className="stat-card">
        <h3>Transições</h3>
        <div className="stat-value">
          {totalTransitions}
        </div>
      </div>

      <div className="stat-card">
        <h3>Palavras</h3>
        <div className="stat-value">
          {totalWords}
        </div>
      </div>

      <div className="stat-card">
        <h3>Caracteres</h3>
        <div className="stat-value">
          {totalCharactersText}
        </div>
      </div>

      <div className="stat-card">
        <h3>Parênteses</h3>
        <div className="stat-value">
          {totalParentheticals}
        </div>
      </div>

      <div className="stat-card">
        <h3>Shots</h3>
        <div className="stat-value">
          {totalShots}
        </div>
      </div>

    </div>

    <div className="character-ranking">

      <h2>🎭 Ranking de Personagens</h2>

      {rankedCharacters.length === 0 ? (

        <p>
          Nenhum personagem encontrado.
        </p>

      ) : (

        rankedCharacters.map(
          ([name, count], index) => (

            <div
              key={name}
              className="character-row"
            >

              <div className="character-name">
                #{index + 1} {name}
              </div>

              <div className="character-count">
                {count}
                {" "}
                {count === 1
                  ? "fala"
                  : "falas"}
              </div>

            </div>

          )
        )

      )}

    </div>

  </div>
);
}