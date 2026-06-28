export const PAGE = {
  width: 850,

  height: 1100,

  paddingTop: 60,
  paddingBottom: 80,

  get contentHeight() {
    return (
      this.height -
      this.paddingTop -
      this.paddingBottom
    );
  },
};