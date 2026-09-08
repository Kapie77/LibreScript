// Tem toda a lógica de cenas.
// Concentra:
// gerar lista de cenas
// cena ativa
// expandir/recolher
// contar blocos da cena
// ir para uma cena
// detectar cena ativa
// esconder blocos

import { useEffect, useState } from "react";
import type { ScriptBlock } from "../../types/script";
// -------------------------------------------------------- //

type Props = {

    blocks: ScriptBlock[];

    blockRefs: React.MutableRefObject<
        Record<number, HTMLDivElement | null>
    >;

};

export function useSceneNavigator({

    blocks,
    blockRefs,

}: Props) {

    // Gerar bloco automaticamente de cena
    const scenes = blocks.filter(

        block => block.type === "scene"

    );

    // Cena ativa
    const [activeSceneId, setActiveSceneId] = useState<number | null>(null);

    // Expandir/recolher cenas
    const [collapsedScenes, setCollapsedScenes] = useState<number[]>([]);

      // UseEffect, cenas começam recolhidas
      useEffect(() => {

        setCollapsedScenes(prev => {

            const newSceneIds = scenes
                .map(scene => scene.id)
                .filter(id => !prev.includes(id));

            if (newSceneIds.length === 0) {
                return prev;
            }

            return [...prev, ...newSceneIds];

        });

    }, [scenes]);

    // Função de alternância
    const toggleScene = (sceneId: number) => {

        setCollapsedScenes((prev) =>

          prev.includes(sceneId)
            ? prev.filter((id) => id !== sceneId)
            : [...prev, sceneId]

        );

      };
    
    // Bloco de cenas organizados
      const getSceneBlockCount = (
        sceneId: number
      ) => {

        const sceneIndex =
          blocks.findIndex(
            (block) => block.id === sceneId
          );

        if (sceneIndex === -1) return 0;

        let count = 0;

        for (
          let i = sceneIndex + 1;
          i < blocks.length;
          i++
        ) {

          if (
            blocks[i].type === "scene"
          ) {
            break;
          }

          count++;
        }

        return count;
      };
    
    // Esconder os blocos da cena recolhida
      const isBlockHidden = (
        blockIndex: number
      ) => {

        let currentSceneId: number | null = null;

        for (
          let i = 0;
          i <= blockIndex;
          i++
        ) {

          const block = blocks[i];

          if (block.type === "scene") {
            currentSceneId = block.id;
          }

        }

        return (
          currentSceneId !== null &&
          collapsedScenes.includes(currentSceneId)
        );

      };
    
    // Função ir para cena
    const goToScene = (id: number) => {
        const element = blockRefs.current[id];

        if (!element) return;

        setActiveSceneId(id);

        element.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    };

    // UseEffect da cena ativa/atual
    useEffect(() => {

        const handleScroll = () => {

            let currentScene: number | null = null;

            scenes.forEach((scene) => {

                const element =
                    blockRefs.current[scene.id];

                if (!element) return;

                const rect =
                    element.getBoundingClientRect();

                if (
                    rect.top >= 0 &&
                    rect.top <= window.innerHeight / 2
                ) {
                    currentScene = scene.id;
                }

            });

            if (currentScene !== null) {
                setActiveSceneId(currentScene);
            }

        };

        window.addEventListener(
            "scroll",
            handleScroll
        );

        handleScroll();

        return () => {

            window.removeEventListener(
                "scroll",
                handleScroll
            );

        };

    }, [scenes, blockRefs]);

// ------------------------------------------------------ //
    return {

        scenes,
        activeSceneId,
        collapsedScenes,
        toggleScene,
        getSceneBlockCount,
        isBlockHidden,
        goToScene,

    };

}