export default {
  id: "instructionUp",
  selector: ".instructions-arrow-up",
  name: "Menu Up Button",
  function: "Moves the bottom info screen to the previous item",
  visible: "y",
  properties: {
    position: { left: "5.8%", top: "89.9%" },
    size: { width: "11.2%", height: "3.05%" },
    rotation: "0deg",
    scale: 1,
    layer: 80
  },
  scripts: ["previousInfoScreen"]
};
