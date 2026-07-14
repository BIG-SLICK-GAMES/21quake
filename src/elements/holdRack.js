export default {
  id: "holdRack",
  selector: ".rack",
  name: "Hold Rack",
  function: "Displays up to five selected tiles and their scoring stack",
  visible: "y",
  properties: {
    position: { left: "0%", top: "0%" },
    size: { width: "97%", height: "100%" },
    rotation: "0deg",
    scale: 1,
    layer: 40
  },
  scripts: ["scoreSelectedTiles", "renderSelectedTiles"]
};
