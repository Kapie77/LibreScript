// Toolbar.tsx
// src/editor/components/Toolbar

// Barra flutuante responsável por inserção de: action, scene, character, dialogue, etc

import type { BlockType } from "../../../types/script";
import type { EditorEngine } from "../../engine/EditorEngine";
// --------------------------------------------------------------- //
type Props = {
    engine: EditorEngine;
};

export default function Toolbar({

    engine

}: Props) {

  // função
  function insert(

      type: BlockType,

      content = ""

  ) {

      engine.insertBlock(

          type,

          content

      );

  }

// --------------------------------------------------------------- //
  return (
    <div className="toolbar">

      
      <button
        onClick={() =>
          insert("scene")
        }
      >
        Scene
      </button>

      <button
        onClick={() =>
          insert("action")
        }
      >
        Action
      </button>

      <div className="toolbar-dropdown">
        <button>
          Character ▼
        </button>

        <div className="dropdown-menu">
          <button onClick={() => insert("character")}>
            Character
          </button>

          <button onClick={() => insert("character_contd")}>
            CONT’D
          </button>

          <button onClick={() => insert("character_os")}>
            O.S.
          </button>

          <button onClick={() => insert("character_vo")}>
            V.O.
          </button>
        </div>
      </div>

      <button
        onClick={() =>
          insert("dialogue")
        }
      >
        Dialogue
      </button>

      <button
        onClick={() =>
          insert("parenthetical")
        }
      >
        Parenthetical
      </button>

      <div className="toolbar-dropdown">

        {/*SHOT*/}
        <button>
          Shot ▼
        </button>

        <div className="dropdown-menu">

          <button
            onClick={() =>
              insert(
                "shot",
                "CLOSE UP:"
              )
            }
          >
            CLOSE UP:
          </button>

          <button
            onClick={() =>
              insert(
                "shot",
                "WIDE SHOT:"
              )
            }
          >
            WIDE SHOT:
          </button>

          <button
            onClick={() =>
              insert(
                "shot",
                "POV:"
              )
            }
          >
            POV:
          </button>

          <button
            onClick={() =>
              insert(
                "shot",
                "OVER THE SHOULDER:"
              )
            }
          >
            OVER THE SHOULDER:
          </button>
          </div>
          </div>

        {/*TRANSITION*/}
        <div className="toolbar-dropdown">
          <button>
            Transition ▼
          </button>

          <div className="dropdown-menu">

            <button
              onClick={() =>
                insert(
                  "transition",
                  "CUT TO:"
                )
              }
            >
              CUT TO:
            </button>

            <button
              onClick={() =>
                insert(
                  "transition",
                  "FADE OUT:"
                )
              }
            >
              FADE OUT:
            </button>

            <button
              onClick={() =>
                insert(
                  "transition",
                  "FADE IN:"
                )
              }
            >
              FADE IN:
            </button>

            <button
              onClick={() =>
                insert(
                  "transition",
                  "DISSOLVE TO:"
                )
              }
            >
              DISSOLVE TO:
            </button>

            <button
              onClick={() =>
                insert(
                  "transition",
                  "SMASH CUT TO:"
                )
              }
            >
              SMASH CUT TO:
            </button>
            </div>

          </div>

        </div>


  );
}