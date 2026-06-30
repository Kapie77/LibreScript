import type { BlockType } from "../types/script";

type Props = {
  onAddBlock: (
    type: BlockType,
    content?: string
  ) => void;
};

export default function Toolbar({ onAddBlock }: Props) {
  return (
    <div className="toolbar">

      
      <button
        onClick={() =>
          onAddBlock("scene")
        }
      >
        Scene
      </button>

      <button
        onClick={() =>
          onAddBlock("action")
        }
      >
        Action
      </button>

      <div className="toolbar-dropdown">
        <button>
          Character ▼
        </button>

        <div className="dropdown-menu">
          <button onClick={() => onAddBlock("character")}>
            Character
          </button>

          <button onClick={() => onAddBlock("character_contd")}>
            CONT’D
          </button>

          <button onClick={() => onAddBlock("character_os")}>
            O.S.
          </button>

          <button onClick={() => onAddBlock("character_vo")}>
            V.O.
          </button>
        </div>
      </div>

      <button
        onClick={() =>
          onAddBlock("dialogue")
        }
      >
        Dialogue
      </button>

      <button
        onClick={() =>
          onAddBlock("parenthetical")
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
              onAddBlock(
                "shot",
                "CLOSE UP:"
              )
            }
          >
            CLOSE UP:
          </button>

          <button
            onClick={() =>
              onAddBlock(
                "shot",
                "WIDE SHOT:"
              )
            }
          >
            WIDE SHOT:
          </button>

          <button
            onClick={() =>
              onAddBlock(
                "shot",
                "POV:"
              )
            }
          >
            POV:
          </button>

          <button
            onClick={() =>
              onAddBlock(
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
                onAddBlock(
                  "transition",
                  "CUT TO:"
                )
              }
            >
              CUT TO:
            </button>

            <button
              onClick={() =>
                onAddBlock(
                  "transition",
                  "FADE OUT:"
                )
              }
            >
              FADE OUT:
            </button>

            <button
              onClick={() =>
                onAddBlock(
                  "transition",
                  "FADE IN:"
                )
              }
            >
              FADE IN:
            </button>

            <button
              onClick={() =>
                onAddBlock(
                  "transition",
                  "DISSOLVE TO:"
                )
              }
            >
              DISSOLVE TO:
            </button>

            <button
              onClick={() =>
                onAddBlock(
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