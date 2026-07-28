// Controla a altura da página do PDF
// Esses valores correspondem ao tamanho A4 do jsPDF

export const PAGE_PDF = {

  width: 210,
  height: 297,
  paddingTop: 20,
  paddingBottom: 20,

  get contentHeight() {

    return (
      this.height -
      this.paddingTop -
      this.paddingBottom
    );

  },

};