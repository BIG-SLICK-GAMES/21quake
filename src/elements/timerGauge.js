export default {
  id: "timer",
  selector: ".timer",
  name: "Drain Timer",
  function: "Counts down to the next automatic quake wave",
  visible: "y",
  properties: {
    position: { left: "6.25%", top: "17.95%" },
    size: { width: "87.5%", height: "6.37%" },
    rotation: "0deg",
    scale: 1,
    layer: 20
  },
  scripts: ["renderTimer", "quakeTimer.tick"]
};
