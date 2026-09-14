// Toolbar.tsx
// src/editor/components/Toolbar

// Barra flutuante responsável por inserção de:
// action, scene, character, dialogue, etc.

import type { BlockType } from "../../../types/script";
import type { EditorEngine } from "../../engine/EditorEngine";

// --------------------------------------------------------------- //

type Props = {
    engine: EditorEngine;
};

// --------------------------------------------------------------- //

export default function Toolbar({

    engine

}: Props) {

    // --------------------------------------------------------------- //
    // Inserir bloco vazio
    // O texto exibido inicialmente será apenas um placeholder visual
    // controlado pelo DocumentView.
    // --------------------------------------------------------------- //

    function insert(type: BlockType) {

        engine.insertBlock(
            type,
            ""
        );

    }

    // --------------------------------------------------------------- //

    return (
        <div className="toolbar">

            {/* SCENE */}

            <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insert("scene")}
            >
                Scene
            </button>


            {/* ACTION */}

            <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                    insert("action")
                }
            >
                Action
            </button>


            {/* CHARACTER */}

            <div className="toolbar-dropdown">

                <button>
                    Character ▼
                </button>

                <div className="dropdown-menu">

                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                            insert("character")
                        }
                    >
                        Character
                    </button>


                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                            insert("character_contd")
                        }
                    >
                        CONT’D
                    </button>


                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                            insert("character_os")
                        }
                    >
                        O.S.
                    </button>


                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                            insert("character_vo")
                        }
                    >
                        V.O.
                    </button>

                </div>

            </div>


            {/* DIALOGUE */}

            <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                    insert("dialogue")
                }
            >
                Dialogue
            </button>


            {/* PARENTHETICAL */}

            <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                    insert("parenthetical")
                }
            >
                Parenthetical
            </button>


            {/* SHOT */}

            <div className="toolbar-dropdown">

                <button>
                    Shot ▼
                </button>

                <div className="dropdown-menu">

                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                            insert("shot")
                        }
                    >
                        SHOT:
                    </button>

                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                            insert("close_up")
                        }
                    >
                        CLOSE UP:
                    </button>


                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                            insert("wide_shot")
                        }
                    >
                        WIDE SHOT:
                    </button>


                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                            insert("pov")
                        }
                    >
                        POV:
                    </button>


                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                            insert("over_the_shoulder")
                        }
                    >
                        OVER THE SHOULDER:
                    </button>

                </div>

            </div>


            {/* TRANSITION */}

            <div className="toolbar-dropdown">

                <button>
                    Transition ▼
                </button>

                <div className="dropdown-menu">

                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                            insert("cut_to")
                        }
                    >
                        CUT TO:
                    </button>


                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                            insert("fade_out")
                        }
                    >
                        FADE OUT:
                    </button>


                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                            insert("fade_in")
                        }
                    >
                        FADE IN:
                    </button>


                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => insert("dissolve_to")}
                    >
                        DISSOLVE TO:
                    </button>


                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>insert("smash_cut_to")}
                    >
                        SMASH CUT TO:
                    </button>

                </div>

            </div>

        </div>
    );
}