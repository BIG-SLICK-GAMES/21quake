export default {
  id: "boardZone",
  selector: ".board-zone",
  name: "Game Board",
  function: "Twenty-five tile stacks and board click targets",
  visible: "y",
  properties: {
    position: { left: "0%", top: "0%" },
    size: { width: "100%", height: "100%" },
    rotation: "0deg",
    scale: 1,
    layer: 30
  },
  scripts: ["selectBoardTile", "dropQuakeTiles"]
};
