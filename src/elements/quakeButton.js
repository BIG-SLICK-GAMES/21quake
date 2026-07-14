export default {
  id: "quakeButton",
  selector: "#quakeButton",
  name: "Quake Button",
  function: "Manually triggers the next quake wave",
  visible: "y",
  properties: {
    position: { left: "82.5%", top: "90.2%" },
    size: { width: "12.2%", height: "6.6%" },
    rotation: "0deg",
    scale: 1,
    layer: 80
  },
  scripts: ["quakeWave"]
};
