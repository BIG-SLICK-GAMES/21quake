export default {
  id: "resetButton",
  selector: "#resetButton",
  name: "Reset Button",
  function: "Resets the game after game over or during play",
  visible: "y",
  properties: {
    position: { left: "79.6%", top: "5.35%" },
    size: { width: "11.9%", height: "7.05%" },
    rotation: "0deg",
    scale: 1,
    layer: 130
  },
  scripts: ["resetGame"]
};
