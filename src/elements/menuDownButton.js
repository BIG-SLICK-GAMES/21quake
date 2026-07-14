export default {
  id: "instructionDown",
  selector: ".instructions-arrow-down",
  name: "Menu Down Button",
  function: "Moves the bottom info screen to the next item",
  visible: "y",
  properties: {
    position: { left: "5.8%", top: "93.65%" },
    size: { width: "11.2%", height: "3.05%" },
    rotation: "0deg",
    scale: 1,
    layer: 80
  },
  scripts: ["nextInfoScreen"]
};
