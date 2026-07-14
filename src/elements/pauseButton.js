export default {
  id: "pauseButton",
  selector: "#pauseButton",
  name: "Pause Button",
  function: "Pauses and resumes the game timer and board input",
  visible: "y",
  properties: {
    position: { left: "61.5%", top: "5.35%" },
    size: { width: "11.9%", height: "7.05%" },
    rotation: "0deg",
    scale: 1,
    layer: 130
  },
  scripts: ["togglePause"]
};
