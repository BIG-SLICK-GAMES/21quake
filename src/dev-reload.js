(function () {
  const intervalMs = 650;
  const watched = [
    "./index.html",
    "./styles.css",
    "./game.js",
    "./quake/timer.js",
    "./ui/applyElementTemplates.js",
    "./elements/background.js",
    "./elements/scoreDisplay.js",
    "./elements/pauseButton.js",
    "./elements/resetButton.js",
    "./elements/timerGauge.js",
    "./elements/gameBoard.js",
    "./elements/holdRack.js",
    "./elements/instructionsScreen.js",
    "./elements/menuUpButton.js",
    "./elements/menuDownButton.js",
    "./elements/quakeButton.js",
    "./elements/index.js"
  ];
  const snapshots = new Map();
  let ready = false;

  async function read(path) {
    const response = await fetch(`${path}?devReload=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return "";
    return response.text();
  }

  function refreshStylesheet() {
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      const cleanHref = link.getAttribute("href").split("?")[0];
      link.href = `${cleanHref}?devReload=${Date.now()}`;
    });
  }

  async function check() {
    try {
      const entries = await Promise.all(watched.map(async (path) => [path, await read(path)]));
      if (!ready) {
        entries.forEach(([path, content]) => snapshots.set(path, content));
        ready = true;
        return;
      }

      for (const [path, content] of entries) {
        if (snapshots.get(path) === content) continue;
        snapshots.set(path, content);
        if (path.endsWith(".css")) {
          refreshStylesheet();
        } else {
          window.location.reload();
        }
        return;
      }
    } catch {
      // Keep the dev watcher silent; nginx may briefly serve while files are being saved.
    }
  }

  window.setInterval(check, intervalMs);
  check();
}());
