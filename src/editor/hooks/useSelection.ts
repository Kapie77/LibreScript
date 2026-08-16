// Texto selecionado pelo usuário

import { useEffect, useState } from "react";

export function useSelection() {

    const [selectedText, setSelectedText] =
        useState("");

    useEffect(() => {

        const updateSelection = () => {

            const selection =
                window.getSelection();

            setSelectedText(
                selection?.toString() ?? ""
            );

        };

        document.addEventListener(
            "selectionchange",
            updateSelection
        );

        return () => {

            document.removeEventListener(
                "selectionchange",
                updateSelection
            );

        };

    }, []);

    return {

        selectedText,

    };

}