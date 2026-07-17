export default {
  id: "instructionsScreen",
  selector: "#instructionsScreen",
  name: "Info Screen",
  function: "Displays total, rules, next prompt, quake help, and leaderboard",
  visible: "y",
  properties: {
    position: { left: "50.148%", top: "93.3%" },
    size: { width: "48.87%", height: "5.35%" },
    rotation: "0deg",
    scale: 2,
    layer: 50
  },
  scripts: ["renderInfoScreen", "cycleInfoScreen"]
};
