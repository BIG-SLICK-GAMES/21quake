export default {
  id: "scorePanel",
  selector: ".score-panel",
  name: "Score Display",
  function: "Shows the current score",
  visible: "y",
  properties: {
    position: { left: "10.185%", top: "6.041%" },
    size: { width: "41.667%", height: "7.029%" },
    rotation: "0deg",
    scale: 1,
    layer: 20
  },
  scripts: ["renderScore"]
};
