// ClipboardManager.ts
// src/editor/clipboard/

export class ClipboardManager {

    async copy(

        text: string

    ): Promise<boolean> {

        if (!text) {

            return false;

        }

        try {

            await navigator.clipboard.writeText(

                text

            );

            return true;

        } catch (error) {

            console.error(

                "Clipboard copy failed",

                error

            );

            return false;

        }

    }

}