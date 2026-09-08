// GuidePage.tsx
// src/editor/pages/Guide/

import "./GuidePage.css";

type GuideItem = {
  title: string;
  description: string;
  example?: string;
};

type GuideSection = {
  category: string;
  items: GuideItem[];
};

const getIdFromTitle = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const handleGuideClick = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;

  el.scrollIntoView({ behavior: "smooth", block: "center" });

  el.classList.add("highlight");

  setTimeout(() => {
    el.classList.remove("highlight");
  }, 1500);
};

const guideData: GuideSection[] = [
  {
    category: "Basic Structure",
    items: [

      {
        title: "INT. (Interior)",
        description: "Indicates the scene takes place indoors.",
        example: "INT. HOUSE – NIGHT",
      },
      {
        title: "EXT. (Exterior)",
        description: "Indicates the scene takes place outdoors.",
        example: "EXT. STREET – DAY",
      },

      {
        title: "DAY / NIGHT",
        description: "Indicates time of day in the scene.",
        example: "DAY / NIGHT / EVENING / MORNING",
      },

      {
        title: "Scene Heading (Slugline)",
        description:
          "Defines location and time. Starts with INT. or EXT.",
        example: "INT. HOUSE – NIGHT",
      },
      {
        title: "Action",
        description:
          "Describes what is happening visually. Always written in present tense.",
        example: "John runs across the street.",
      },
      {
        title: "Character",
        description:
          "Indicates who is speaking. Written in uppercase.",
        example: "JOHN",
      },
      {
        title: "Dialogue",
        description:
          "What the character says.",
        example: "I can't do this anymore.",
      },
    ],
  },
  {
    category: "Character Variations",
    items: [
      {
        title: "(V.O.) – Voice Over",
        description:
          "Character is heard but not present in the scene.",
        example: "SARAH (V.O.)",
      },
      {
        title: "(O.S.) – Off Screen",
        description:
          "Character is in the scene but not visible.",
        example: "MIKE (O.S.)",
      },
      {
        title: "(CONT'D)",
        description:
          "Indicates the character continues speaking.",
        example: "JOHN (CONT'D)",
      },
    ],
  },
  {
    category: "Direction & Transitions",
    items: [
      {
        title: "FADE IN",
        description: "Beginning of the script.",
        example: "FADE IN:",
      },
      {
        title: "FADE OUT",
        description: "End of scene or script.",
        example: "FADE OUT.",
      },
      {
        title: "CUT TO",
        description: "Standard scene transition.",
        example: "CUT TO:",
      },
      {
        title: "DISSOLVE TO",
        description: "Smooth transition between scenes.",
        example: "DISSOLVE TO:",
      },
      {
        title: "SMASH CUT TO",
        description: "Abrupt and dramatic cut.",
        example: "SMASH CUT TO:",
      },
    ],
  },
  {
    category: "Shots & Camera",
    items: [
      {
        title: "CLOSE UP (CU)",
        description: "Focuses on a detail or face.",
        example: "CLOSE UP – John's eyes.",
      },
      {
        title: "WIDE SHOT (WS)",
        description: "Shows the full environment.",
        example: "WIDE SHOT – Empty street.",
      },
      {
        title: "POV (Point of View)",
        description: "Shows what the character sees.",
        example: "POV – The door opens slowly.",
      },
      {
        title: "OVER THE SHOULDER (OTS)",
        description: "Camera behind a character.",
        example: "OTS – Sarah watching John.",
      },
    ],
  },
  {
    category: "Extras",
    items: [
      {
        title: "Parenthetical",
        description:
          "Indicates how a line is delivered.",
        example: "(whispering)",
      },
      {
        title: "Beat",
        description:
          "A pause in dialogue or action.",
        example: "(beat)",
      },
    ],
  },
];

export default function GuidePage() {
  return (
    <div className="guide-page">
      <h1>📖 Screenwriting Guide</h1>

      <div className="guide-content">
        <p className="guide-description">
          Learn the essential elements used in professional screenwriting.
        </p>

        {guideData.map((section, index) => (
          <div key={index} className="guide-section">
            <h3>{section.category}</h3>

            <div className="guide-grid">
              {section.items.map((item, i) => (
                <div
                    key={i}
                    id={getIdFromTitle(item.title)}
                    className="guide-card"
                  >
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>

                  {item.example && (
                    <pre className="guide-example">
                      {item.example}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 🎬 EXAMPLE SCRIPT */}
          <div className="guide-section">
              <h3>Example Script</h3>

              <div className="script">

                {/* FADE IN */}
                <p className="transition">
                  FADE IN:{" "}
                  <button
                    onClick={() => handleGuideClick("fade-in")}
                    className="guide-btn"
                  >?</button>
                </p>

                <p className="scene-heading">
                  INT.
                  <button onClick={() => handleGuideClick(getIdFromTitle("INT. (Interior)"))} className="guide-btn">?</button>{" "}
                  COFFEE SHOP - DAY
                  <button onClick={() => handleGuideClick(getIdFromTitle("DAY / NIGHT"))} className="guide-btn">?</button>{" "}
                  <button onClick={() => handleGuideClick(getIdFromTitle("Scene Heading (Slugline)"))} className="guide-btn">?</button>
                </p>

                <p className="action">
                  A quiet café. Sunlight spills through the windows, illuminating the empty tables.
                </p>

                <p className="shot">
                  <strong>CLOSE UP</strong>{" "}
                  <button
                    onClick={() =>
                      handleGuideClick(getIdFromTitle("CLOSE UP (CU)"))
                    }
                    className="guide-btn"
                  >
                    ?
                  </button>{" "}
                  on a steaming cup of coffee.
                </p>

                <p className="character">
                  JOHN{" "}
                  <button
                    onClick={() => handleGuideClick(getIdFromTitle("Character"))}
                    className="guide-btn"
                  >?</button>
                </p>

                <p className="dialogue">
                  I have a feeling this is where everything changes.
                </p>

                <p className="character">
                  SARAH (O.S.){" "}
                  <button
                    onClick={() =>
                      handleGuideClick(getIdFromTitle("(O.S.) – Off Screen"))
                    }
                    className="guide-btn"
                  >
                    ?
                  </button>
                </p>

                <p className="parenthetical">
                  (whispering){" "}
                  <button
                    onClick={() => handleGuideClick("parenthetical")}
                    className="guide-btn"
                  >?</button>
                </p>

                <p className="dialogue">
                  Are you sure about that?
                </p>

                <p className="character">
                  SARAH (V.O.){" "}
                  <button
                    onClick={() => handleGuideClick(getIdFromTitle("(V.O.) – Voice Over"))}
                    className="guide-btn"
                  >
                    ?
                  </button>
                </p>

                <p className="dialogue">
                  Sometimes we don’t realize it… until it’s too late.
                </p>

                <p className="shot">
                  <strong>POV</strong>{" "}
                  <button
                    onClick={() =>
                      handleGuideClick(getIdFromTitle("POV (Point of View)"))
                    }
                    className="guide-btn"
                  >
                    ?
                  </button>{" "}
                  — John looks toward the door.
                </p>

                <p className="shot">
                  <strong>OVER THE SHOULDER</strong>{" "}
                  <button
                    onClick={() => handleGuideClick(getIdFromTitle("OVER THE SHOULDER (OTS)"))}
                    className="guide-btn"
                  >
                    ?
                  </button>{" "}
                  — Sarah watches John closely.
                </p>

                <p className="transition">
                  DISSOLVE TO:{" "}
                  <button
                    onClick={() => handleGuideClick("dissolve-to")}
                    className="guide-btn"
                  >?</button>
                </p>

                <p className="scene-heading">
                  EXT.
                  <button
                    onClick={() => handleGuideClick(getIdFromTitle("EXT. (Exterior)"))}
                    className="guide-btn"
                  >?</button>{" "}
                  STREET - DAY
                 
                </p>

                <p className="shot">
                  <strong>WIDE SHOT</strong>{" "}                  
                  <button
                    onClick={() =>
                      handleGuideClick(getIdFromTitle("WIDE SHOT (WS)"))
                    }
                    className="guide-btn"
                  >
                    ?
                  </button>{" "}
                  of a busy street.
                </p>

                <p className="character">
                  JOHN (CONT'D){" "}
                  <button
                    onClick={() =>
                      handleGuideClick(getIdFromTitle("(CONT'D)"))
                    }
                    className="guide-btn"
                  >
                    ?
                  </button>
                </p>

                <p className="dialogue">
                  Maybe it's already too late.
                </p>

                <p className="transition">
                  FADE OUT.{" "}
                  <button
                    onClick={() => handleGuideClick("fade-out")}
                    className="guide-btn"
                  >?</button>
                </p>

                <p className="scene-heading">
                  INT.
                  {" "}
                  DRUGSTORE - NIGHT
                  <button
                    onClick={() => handleGuideClick(getIdFromTitle("DAY / NIGHT"))}
                    className="guide-btn"
                  >?</button>
                </p>

                <p className="action">
                  The drugstore is crowded, filled with restless customers.
                </p>

                <p className="character">
                  JOHN
                </p>

                <p className="dialogue">
                  Do you have anything for a headache?
                </p>

                <p className="parenthetical">
                  (beat){" "}
                  <button
                    onClick={() => handleGuideClick(getIdFromTitle("Beat"))}
                    className="guide-btn"
                  >
                    ?
                  </button>
                </p>

                <p className="character">
                  PHARMACIST
                </p>

                <p className="dialogue">
                  This should help.
                </p>

                <p className="transition">
                  SMASH CUT TO:{" "}
                  <button
                    onClick={() => handleGuideClick(getIdFromTitle("SMASH CUT TO"))}
                    className="guide-btn"
                  >
                    ?
                  </button>
                </p>

                <p className="scene-heading">
                  INT.
                  {" "}
                  HOUSE - MIDNIGHT
                  
                </p>

                <p className="action">
                  John lies awake in bed, staring at the ceiling.
                </p>

                <p className="transition">
                  CUT TO:{" "}
                  <button
                    onClick={() => handleGuideClick(getIdFromTitle("CUT TO"))}
                    className="guide-btn"
                  >
                    ?
                  </button>
                </p>

              </div>
            </div>
          
          {/* */}


        </div>
      </div>

  );
}