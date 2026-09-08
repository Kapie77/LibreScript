import type { EditorCommand } from "./EditorCommands";
import type { EditorState } from "./EditorState";

export function editorReducer(

    state: EditorState,

    command: EditorCommand

): EditorState {

    switch (command.type) {

        case "FOCUS_BLOCK":

            return {

                ...state,

                activeBlockId: command.blockId,

            };

        case "BLUR_BLOCK":

            return {

                ...state,

                activeBlockId: null,

            };

        case "START_COMPOSITION":

            return {

                ...state,

                composing: true,

            };

        case "END_COMPOSITION":

            return {

                ...state,

                composing: false,

            };

        default:

            return state;

    }

}