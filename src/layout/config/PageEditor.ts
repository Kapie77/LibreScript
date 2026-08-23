// PageEditor.ts
// src/layout/config/

// Altura da página do Editor
// Esses valores correspondem ao tamanho A4 do jsPDF

export const PAGE_EDITOR = {

    width: 850,
    height: 1100,

    paddingTop: 60,
    paddingBottom: 80,

    paddingLeft: 60,
    paddingRight: 60,

    get contentHeight() {

        return (
            this.height -
            this.paddingTop -
            this.paddingBottom
        );

    },

    get contentWidth() {

        return (
            this.width -
            this.paddingLeft -
            this.paddingRight
        );

    },

};