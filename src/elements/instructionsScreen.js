export default {
  id: "instructionsScreen",
  selector: "#instructionsScreen",
  name: "Info Screen",
  function: "Displays total, rules, next prompt, quake help, and leaderboard",
  visible: "y",
  properties: {
    position: { left: "25.148%", top: "91.3%" },
    size: { width: "48.87%", height: "5.35%" },
    rotation: "0deg",
    scale: 1,
    layer: 50
  },
  scripts: ["renderInfoScreen", "cycleInfoScreen"]
};
