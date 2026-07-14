export default {
  id: "phoneTemplate",
  selector: ".phone-template",
  name: "Device Background",
  function: "Static device shell and parent coordinate space",
  visible: "y",
  properties: {
    position: { left: "0%", top: "0%" },
    size: { width: "100%", height: "100%" },
    rotation: "0deg",
    scale: 1,
    layer: 0
  },
  assets: {
    image: "./assets/quake-device-v11-clean-background.png"
  },
  scripts: []
};
