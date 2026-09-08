// Função de ir para cena

import type { ScriptBlock } from "../../../types/script";
// ---------------------------------------------- //
type Props = {

    showNavigator: boolean;
    scenes: ScriptBlock[];
    activeSceneId: number | null;
    collapsedScenes: number[];

    goToScene: (
        id: number
    ) => void;

    toggleScene: (
        id: number
    ) => void;

    getSceneBlockCount: (
        sceneId: number
    ) => number;

};
// ---------------------------------------------- //
export default function SceneList({

    showNavigator,
    scenes,
    activeSceneId,
    collapsedScenes,
    goToScene,
    toggleScene,
    getSceneBlockCount,

}: Props) {
    
if (!showNavigator) return null;
// ---------------------------------------------- //
    return (

      <div className="scene-list">
        <h3>Cenas</h3>

        {scenes.map((scene, index) => (
          <div
            key={scene.id}
            className={
              activeSceneId === scene.id
                ? "scene-item active"
                : "scene-item"
            }
          >

            <div
              className="scene-header"
              onClick={() => goToScene(scene.id)}
            >
              <strong>
                Cena {index + 1}
              </strong>

              <div className="scene-title">
                {scene.content}
              </div>

              <small>
                {collapsedScenes.includes(scene.id)
                  ? `${getSceneBlockCount(scene.id)} ocultos`
                  : `${getSceneBlockCount(scene.id)} blocos`
                }
              </small>
            </div>

            <button
              className="collapse-btn"
              onClick={() => toggleScene(scene.id)}
            >
              {collapsedScenes.includes(scene.id)
                ? "▶"
                : "▼"}
            </button>

          </div>
          ))}

      </div>

    );

}