import { TIMER_MAX_SECONDS, createQuakeTimer } from "./quake/timer.js";
import { applyElementTemplates } from "./ui/applyElementTemplates.js";

const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const values = { A: 1, J: 10, Q: 10, K: 10, "10": 10 };
const size = 5;
const boardSourceWidth = 912;
const boardSourceHeight = 1696;
const maxSelectedTiles = 5;
const pointsPerTile = 50;
const tileSkinCount = 5;
const cellBounds = [
  [105.5, 503, 110, 110],
  [251.5, 503, 110, 110],
  [398, 503, 110, 110],
  [544.5, 503, 110, 110],
  [691, 503, 110, 110],
  [105.5, 639.5, 110, 110],
  [251.5, 639.5, 110, 110],
  [398, 639.5, 110, 110],
  [544.5, 639.5, 110, 110],
  [691.5, 639, 110, 110],
  [105.5, 774, 110, 110],
  [251.5, 773.5, 110, 110],
  [398, 774, 110, 110],
  [544.5, 774, 110, 110],
  [691.5, 773.5, 110, 110],
  [105.5, 908, 110, 110],
  [251.5, 908, 110, 110],
  [398, 908, 110, 110],
  [544.5, 908, 110, 110],
  [691, 908, 110, 110],
  [105.5, 1043, 110, 110],
  [251.5, 1043, 110, 110],
  [398, 1043, 110, 110],
  [544.5, 1043, 110, 110],
  [691, 1042.5, 110, 110]
];
const board = Array.from({ length: size }, () => Array.from({ length: size }, () => []));
const selectedTiles = [];
const quakeTimer = createQuakeTimer();
const infoScreenCount = 5;
let score = 0;
let impacts = [];
let isPaused = false;
let isTimerRefilling = false;
let isGameOver = false;
let isResolvingSelection = false;
let infoIndex = 0;
let renderedMenuText = "";
let movingSelection = null;
let tileId = 0;

const boardEl = document.getElementById("board");
const boardFrameEl = boardEl.parentElement;
const selectedHoldEl = document.getElementById("selectedHold");
const scoreValueEl = document.getElementById("scoreValue");
const timerPanelEl = document.getElementById("timerPanel");
const timerTicksEl = document.getElementById("timerTicks");
const quakeButtonEl = document.getElementById("quakeButton");
const pauseButtonEl = document.getElementById("pauseButton");
const instructionsScreenEl = document.getElementById("instructionsScreen");
const instructionUpEl = document.querySelector(".instructions-arrow-up");
const instructionDownEl = document.querySelector(".instructions-arrow-down");
const resetButtonEl = document.getElementById("resetButton");

applyElementTemplates();

function tileValue(rank) {
  return values[rank] || Number(rank);
}

function randomRank() {
  return ranks[Math.floor(Math.random() * ranks.length)];
}

function makeTile(rank = randomRank()) {
  return {
    id: `tile-${tileId += 1}`,
    rank,
    skin: Math.floor(Math.random() * tileSkinCount) + 1,
    value: tileValue(rank)
  };
}

function tileStackAt(index) {
  const row = Math.floor(index / size);
  const col = index % size;
  return board[row][col];
}

function selectedTotal() {
  return selectedTiles.reduce((sum, tile) => sum + tile.value, 0);
}

function topTile(stack) {
  return stack.length ? stack[stack.length - 1] : null;
}

function boardTileCount() {
  return board.flat().reduce((sum, stack) => sum + stack.length, 0);
}

function holdSlotBounds(index) {
  const slotLefts = [82, 241, 398, 556, 718];
  return [slotLefts[index], 1250, 108, 108];
}

function tileSpritePath(tile) {
  if (!tile?.rank) return "./assets/tiles-varied-v1/tile-default.png";
  return `./assets/tiles-varied-v1/${tile.rank}-${tile.skin || 1}.png`;
}

function tileElement(tile, falling) {
  const el = document.createElement("div");
  el.className = `tile${falling ? " falling" : ""}`;
  const face = document.createElement("div");
  face.className = "tile-face";
  face.style.backgroundImage = `url("${tileSpritePath(tile)}")`;
  el.appendChild(face);
  return el;
}

function render() {
  boardEl.innerHTML = "";
  board.flat().forEach((stack, index) => {
    const [left, top, width, height] = cellBounds[index];
    const cell = document.createElement("button");
    cell.className = `cell cell-${index + 1}`;
    cell.dataset.cell = String(index + 1);
    cell.dataset.row = String(Math.floor(index / size) + 1);
    cell.dataset.col = String((index % size) + 1);
    cell.style.setProperty("--cell-left", `${(left / boardSourceWidth) * 100}%`);
    cell.style.setProperty("--cell-top", `${(top / boardSourceHeight) * 100}%`);
    cell.style.setProperty("--cell-width", `${(width / boardSourceWidth) * 100}%`);
    cell.style.setProperty("--cell-height", `${(height / boardSourceHeight) * 100}%`);
    cell.type = "button";
    cell.ariaLabel = `Board cell ${index + 1}`;
    cell.addEventListener("click", () => selectBoardTile(index));
    stack.forEach((tile, stackIndex) => {
      const tileNode = tileElement(tile, false);
      tileNode.classList.add("stacked-tile");
      tileNode.style.setProperty("--stack-index", String(stackIndex));
      tileNode.style.setProperty("--stack-depth", String(stack.length));
      cell.appendChild(tileNode);
    });
    impacts.filter((impact) => impact.index === index).forEach((impact) => {
      cell.classList.add("impact-cell");
      const meteor = tileElement(impact.tile, true);
      meteor.classList.add("meteor-tile");
      cell.appendChild(meteor);
      if (impact.phase === "smash") {
        const smoke = document.createElement("div");
        smoke.className = "impact-smoke";
        cell.appendChild(smoke);
        const burst = document.createElement("div");
        burst.className = "impact-burst";
        cell.appendChild(burst);
      }
    });
    boardEl.appendChild(cell);
  });

  selectedHoldEl.innerHTML = "";
  selectedTiles.forEach((tile, index) => {
    const slot = document.createElement("div");
    slot.className = `tile-slot rack-slot-${index + 1}`;
    const tileNode = tileElement(tile, false);
    if (movingSelection?.tileId === tile.id) {
      const [, , holdWidth, holdHeight] = holdSlotBounds(index);
      const [fromLeft, fromTop, fromWidth, fromHeight] = movingSelection.fromBounds;
      const [toLeft, toTop, toWidth, toHeight] = holdSlotBounds(index);
      const fromCenterX = fromLeft + (fromWidth / 2);
      const fromCenterY = fromTop + (fromHeight / 2);
      const toCenterX = toLeft + (toWidth / 2);
      const toCenterY = toTop + (toHeight / 2);
      tileNode.classList.add("moving-to-hold");
      tileNode.style.setProperty("--move-from-x", `${((fromCenterX - toCenterX) / holdWidth) * 100}%`);
      tileNode.style.setProperty("--move-from-y", `${((fromCenterY - toCenterY) / holdHeight) * 100}%`);
      tileNode.addEventListener("animationend", () => {
        movingSelection = null;
        render();
      }, { once: true });
    }
    slot.appendChild(tileNode);
    selectedHoldEl.appendChild(slot);
  });

  scoreValueEl.textContent = String(score);
  renderInfoScreen();
  renderTimer();
}

function renderInfoScreen() {
  const text = currentMenuText();
  if (text === renderedMenuText) return;
  renderedMenuText = text;
  instructionsScreenEl.textContent = text;
  instructionsScreenEl.scrollTop = 0;
}

function currentMenuText() {
  if (isGameOver) {
    return ["GAME OVER", `SCORE ${score}`, "PRESS X TO RESET"].join("\n");
  }
  if (infoIndex === 0) return [`TOTAL ${selectedTotal()} / 21`, `HELD ${selectedTiles.length}/${maxSelectedTiles}  SCORE ${score}`].join("\n");
  if (infoIndex === 1) return ["NEXT", "MAKE 21 OR SURVIVE QUAKE"].join("\n");
  if (infoIndex === 2) return ["RULES", "OVER 21 OR 5 HELD = GAME OVER"].join("\n");
  if (infoIndex === 3) return ["NEED MORE TILES?", "HIT THE QUAKE BUTTON", "TO GENERATE A QUAKE!"].join("\n");
  return ["LEADERBOARD", `TOP SCORE ${score}`, `YOUR BEST ${score}`].join("\n");
}

function renderTimer() {
  const timer = quakeTimer.snapshot();
  timerPanelEl.classList.toggle("refilling", isTimerRefilling);
  timerPanelEl.style.setProperty("--timer-frame", String(Math.max(0, timer.filledTicks - 1)));
  timerPanelEl.style.setProperty("--timer-progress", String(timer.filledTicks / TIMER_MAX_SECONDS));
  timerTicksEl.innerHTML = "";
  for (let second = 1; second <= TIMER_MAX_SECONDS; second += 1) {
    const tick = document.createElement("span");
    tick.className = `quake-tick${second <= timer.filledTicks ? " filled" : ""}`;
    tick.style.setProperty("--i", second - 1);
    tick.ariaHidden = "true";
    timerTicksEl.appendChild(tick);
  }
}

function selectBoardTile(index) {
  if (isPaused || isGameOver || isResolvingSelection) return;
  const stack = tileStackAt(index);
  if (!stack.length) return;
  if (selectedTiles.length >= maxSelectedTiles) {
    endGame();
    return;
  }
  const tile = stack.pop();
  selectedTiles.push(tile);
  movingSelection = {
    tileId: tile.id,
    fromBounds: cellBounds[index]
  };
  const total = selectedTotal();
  if (total > 21) {
    render();
    endGame();
    return;
  }
  if (total === 21) scoreSelectedTiles();
  else if (selectedTiles.length === maxSelectedTiles) {
    render();
    endGame();
    return;
  }
  render();
}

function scoreSelectedTiles() {
  isResolvingSelection = true;
  score += selectedTiles.length * pointsPerTile;
  selectedHoldEl.classList.add("crumbling");
  setTimeout(() => {
    selectedTiles.length = 0;
    selectedHoldEl.classList.remove("crumbling");
    isResolvingSelection = false;
    render();
  }, 420);
}

function endGame() {
  isGameOver = true;
  isPaused = true;
  document.body.classList.add("game-over");
  render();
}

function allBoardCellIndexes() {
  return Array.from({ length: size * size }, (_, index) => index);
}

function randomUniqueIndexes(source, count) {
  const pool = [...source];
  const picked = [];
  while (pool.length && picked.length < count) {
    const poolIndex = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(poolIndex, 1)[0]);
  }
  return picked;
}

function dropQuakeTiles() {
  if (isPaused || isGameOver) return;
  const targets = randomUniqueIndexes(allBoardCellIndexes(), 3);
  if (!targets.length) return;
  impacts = targets.map((index) => ({ index, tile: makeTile(), phase: "falling" }));
  render();
  setTimeout(() => {
    impacts = impacts.map((impact) => ({ ...impact, phase: "smash" }));
    impacts.forEach((impact) => tileStackAt(impact.index).push(impact.tile));
    render();
  }, 620);
  setTimeout(() => {
    impacts = [];
    render();
  }, 1120);
}

function quakeWave() {
  dropQuakeTiles();
  quakeTimer.refillAfterQuake();
  isTimerRefilling = true;
  setTimeout(() => {
    isTimerRefilling = false;
    render();
  }, 360);
}

function resetGame() {
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) board[row][col] = [makeTile()];
  }
  selectedTiles.length = 0;
  impacts = [];
  score = 0;
  isPaused = false;
  isTimerRefilling = false;
  isGameOver = false;
  isResolvingSelection = false;
  infoIndex = 0;
  renderedMenuText = "";
  pauseButtonEl.textContent = "II";
  document.body.classList.remove("game-over", "paused");
  quakeTimer.reset();
  render();
}

function togglePause() {
  if (isGameOver) return;
  isPaused = !isPaused;
  pauseButtonEl.textContent = isPaused ? ">" : "II";
  document.body.classList.toggle("paused", isPaused);
}

pauseButtonEl.addEventListener("click", togglePause);

resetButtonEl.addEventListener("click", resetGame);
quakeButtonEl.addEventListener("click", quakeWave);

setInterval(() => {
  if (isPaused || isGameOver) return;
  quakeTimer.tick();
  if (quakeTimer.isExpired()) quakeWave();
  render();
}, 1000);

instructionDownEl.addEventListener("click", () => {
  infoIndex = Math.min(infoScreenCount - 1, infoIndex + 1);
  renderedMenuText = "";
  renderInfoScreen();
});

instructionUpEl.addEventListener("click", () => {
  infoIndex = Math.max(0, infoIndex - 1);
  renderedMenuText = "";
  renderInfoScreen();
});

instructionsScreenEl.addEventListener("click", () => {
  infoIndex = (infoIndex + 1) % infoScreenCount;
  renderedMenuText = "";
  renderInfoScreen();
});

resetGame();
