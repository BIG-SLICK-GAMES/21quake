const mongoose = require('mongoose');

const User = require('../users/user.model');
const {
  QUAKE_DIFFICULTIES,
  QUAKE_EXTRA_GAME_COST,
  QUAKE_FREE_GAMES_PER_DIFFICULTY_DAILY,
  QUAKE_MULTIPLIERS,
  QUAKE_STARTING_FILLED_TILES,
  QUAKE_WEEKLY_PRIZES,
} = require('./quake.constants');
const QUAKEDailyUsage = require('./quake-daily-usage.model');
const QUAKERun = require('./quake-run.model');
const QUAKESession = require('./quake-session.model');
const QUAKETransaction = require('./quake-transaction.model');
const QUAKEWeeklyLeaderboard = require('./quake-weekly-leaderboard.model');

function isValidDifficulty(difficulty) {
  return QUAKE_DIFFICULTIES.includes(difficulty);
}

function assertDifficulty(difficulty) {
  if (!isValidDifficulty(difficulty)) {
    const error = new Error('Invalid QUAKE difficulty.');
    error.statusCode = 400;
    throw error;
  }
}

function assertCardsUsed(cardsUsed) {
  const parsed = Number(cardsUsed);
  if (!Number.isInteger(parsed) || parsed < 2 || parsed > 5) {
    const error = new Error('Invalid card count.');
    error.statusCode = 400;
    throw error;
  }

  return parsed;
}

function roundChipAmount(amount) {
  return Math.round(Number(amount) || 0);
}

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getUsageField(difficulty) {
  return {
    easy: 'nEasyUsed',
    medium: 'nMediumUsed',
    hard: 'nHardUsed',
  }[difficulty];
}

function serializeDailyUsage(usage) {
  const used = {
    easy: Number(usage?.nEasyUsed) || 0,
    medium: Number(usage?.nMediumUsed) || 0,
    hard: Number(usage?.nHardUsed) || 0,
  };

  return {
    easy: Math.max(0, QUAKE_FREE_GAMES_PER_DIFFICULTY_DAILY - used.easy),
    medium: Math.max(0, QUAKE_FREE_GAMES_PER_DIFFICULTY_DAILY - used.medium),
    hard: Math.max(0, QUAKE_FREE_GAMES_PER_DIFFICULTY_DAILY - used.hard),
  };
}

function buildStartingFilledTiles(count) {
  const cells = Array.from({ length: 25 }, (_, index) => ({
    col: index % 5,
    row: Math.floor(index / 5),
  }));

  for (let index = cells.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = cells[index];
    cells[index] = cells[swapIndex];
    cells[swapIndex] = current;
  }

  return cells.slice(0, count);
}

function getWeekRange(date = new Date()) {
  const current = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = current.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(current);
  start.setUTCDate(current.getUTCDate() + mondayOffset);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);
  end.setUTCMilliseconds(-1);

  return { end, start };
}

function toLeaderboardEntry(run) {
  return {
    _id: String(run._id),
    adjustedScore: Number(run.nAdjustedScore) || 0,
    bonusMultiplier: Number(run.nBonusMultiplier) || 1,
    buyIn: Number(run.nBuyIn) || 0,
    createdAt: run.dCreatedDate,
    difficulty: run.eDifficulty || 'easy',
    linesCompleted: Number(run.nLinesCompleted) || 0,
    playerName: run.sUserName || 'Player',
    result: run.eResult || 'timeout',
    score: Number(run.nScore) || 0,
    spareSeconds: Number(run.nSpareSeconds) || 0,
    turns: Number(run.nTurns) || 0,
    userId: run.iUserId ? String(run.iUserId) : undefined,
  };
}

function serializeWeeklyEntry(entry) {
  return {
    _id: String(entry._id),
    bestSingleWin: Number(entry.nBestSingleWin) || 0,
    difficulty: entry.eDifficulty,
    gamesPlayed: Number(entry.nGamesPlayed) || 0,
    playerId: String(entry.iUserId),
    playerName: entry.sUserName || 'Player',
    successful21Count: Number(entry.nSuccessful21Count) || 0,
    totalQUAKEChipsWon: Number(entry.nTotalQUAKEChipsWon) || 0,
    weekEndDate: entry.dWeekEndDate,
    weekStartDate: entry.dWeekStartDate,
  };
}

function serializeSession(session, freeGamesRemaining, chipBalance) {
  return {
    currentChipBalance: typeof chipBalance === 'number' ? chipBalance : undefined,
    difficulty: session.eDifficulty,
    entryCostCharged: Number(session.nEntryCostCharged) || 0,
    freeAttempt: Boolean(session.bFreeAttempt),
    freeGamesRemaining,
    gameSessionId: String(session._id),
    startingFilledTiles: session.aStartingFilledTiles || [],
    startingFilledTilesCount: Number(session.nStartingFilledTilesCount) || 0,
  };
}

async function getDailyStatus(user) {
  const usage = await QUAKEDailyUsage.findOne({
    iUserId: user._id,
    sDateKey: getDateKey(),
  }).lean();

  return {
    chipBalance: Number(user.nChips) || 0,
    extraGameCost: QUAKE_EXTRA_GAME_COST,
    freeGamesRemaining: serializeDailyUsage(usage),
  };
}

async function startGame(user, difficulty) {
  assertDifficulty(difficulty);

  const dateKey = getDateKey();
  const usageField = getUsageField(difficulty);
  const usage = await QUAKEDailyUsage.findOneAndUpdate(
    { iUserId: user._id, sDateKey: dateKey },
    { $setOnInsert: { iUserId: user._id, sDateKey: dateKey } },
    { new: true, upsert: true }
  );
  const usedCount = Number(usage[usageField]) || 0;
  const freeAttempt = usedCount < QUAKE_FREE_GAMES_PER_DIFFICULTY_DAILY;
  let entryCostCharged = 0;
  let updatedUser = user;

  if (freeAttempt) {
    usage[usageField] = usedCount + 1;
    await usage.save();
  } else {
    const debited = await User.findOneAndUpdate(
      { _id: user._id, nChips: { $gte: QUAKE_EXTRA_GAME_COST } },
      { $inc: { nChips: -QUAKE_EXTRA_GAME_COST } },
      { new: true }
    );

    if (!debited) {
      const error = new Error("You need 50 chips to play another Quake game");
      error.statusCode = 402;
      throw error;
    }

    updatedUser = debited;
    entryCostCharged = QUAKE_EXTRA_GAME_COST;
  }

  const startingFilledTilesCount = QUAKE_STARTING_FILLED_TILES[difficulty];
  const session = await QUAKESession.create({
    aStartingFilledTiles: buildStartingFilledTiles(startingFilledTilesCount),
    bFreeAttempt: freeAttempt,
    eDifficulty: difficulty,
    iUserId: user._id,
    nEntryCostCharged: entryCostCharged,
    nStartingFilledTilesCount: startingFilledTilesCount,
    sUserName: user.sUserName || 'Player',
  });

  if (entryCostCharged > 0) {
    await QUAKETransaction.create({
      eDirection: 'debit',
      eType: 'entry',
      iSessionId: session._id,
      iUserId: user._id,
      nAmount: entryCostCharged,
      sDescription: 'QUAKE extra game entry fee',
    });
  }

  const freeGamesRemaining = serializeDailyUsage(usage);
  return serializeSession(session, freeGamesRemaining[difficulty], Number(updatedUser.nChips) || 0);
}

async function updateWeeklyLeaderboard({ difficulty, rewardAmount, user }) {
  const { end, start } = getWeekRange();
  await QUAKEWeeklyLeaderboard.findOneAndUpdate(
    {
      dWeekStartDate: start,
      eDifficulty: difficulty,
      iUserId: user._id,
    },
    {
      $inc: {
        nGamesPlayed: 1,
        nSuccessful21Count: rewardAmount > 0 ? 1 : 0,
        nTotalQUAKEChipsWon: rewardAmount,
      },
      $max: { nBestSingleWin: rewardAmount },
      $set: {
        dWeekEndDate: end,
        sUserName: user.sUserName || 'Player',
      },
      $setOnInsert: {
        dWeekStartDate: start,
        eDifficulty: difficulty,
        iUserId: user._id,
      },
    },
    { new: true, upsert: true }
  );
}

async function completeGame(user, { cardsUsed, finalTotal, gameSessionId }) {
  if (!mongoose.Types.ObjectId.isValid(gameSessionId)) {
    const error = new Error('Invalid game session.');
    error.statusCode = 400;
    throw error;
  }

  const parsedCardsUsed = assertCardsUsed(cardsUsed);
  const parsedFinalTotal = Number(finalTotal);
  if (!Number.isFinite(parsedFinalTotal)) {
    const error = new Error('Invalid final total.');
    error.statusCode = 400;
    throw error;
  }

  const session = await QUAKESession.findById(gameSessionId);
  if (!session) {
    const error = new Error('Invalid game session.');
    error.statusCode = 404;
    throw error;
  }

  if (String(session.iUserId) !== String(user._id)) {
    const error = new Error('You cannot complete a QUAKE game you did not start.');
    error.statusCode = 403;
    throw error;
  }

  if (session.eStatus === 'completed') {
    const error = new Error('This QUAKE game is already completed.');
    error.statusCode = 409;
    throw error;
  }

  assertDifficulty(session.eDifficulty);

  const made21 = parsedFinalTotal === 21;
  const multiplier = made21 ? QUAKE_MULTIPLIERS[session.eDifficulty][parsedCardsUsed] : null;
  if (made21 && !multiplier) {
    const error = new Error('Invalid card count.');
    error.statusCode = 400;
    throw error;
  }

  const rewardAmount = made21 ? roundChipAmount(QUAKE_EXTRA_GAME_COST * multiplier) : 0;
  let updatedUser = user;

  if (rewardAmount > 0) {
    updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $inc: { nChips: rewardAmount } },
      { new: true }
    );

    await QUAKETransaction.create({
      eDirection: 'credit',
      eType: 'reward',
      iSessionId: session._id,
      iUserId: user._id,
      nAmount: rewardAmount,
      sDescription: `QUAKE ${session.eDifficulty} ${parsedCardsUsed}-card 21 reward`,
    });
  }

  session.bRewardPaid = rewardAmount > 0;
  session.dCompletedDate = new Date();
  session.eStatus = 'completed';
  session.nCardsUsed = parsedCardsUsed;
  session.nFinalTotal = parsedFinalTotal;
  session.nMultiplier = multiplier;
  session.nRewardAmount = rewardAmount;
  await session.save();

  await updateWeeklyLeaderboard({
    difficulty: session.eDifficulty,
    rewardAmount,
    user,
  });

  return {
    cardsUsed: parsedCardsUsed,
    currentChipBalance: Number(updatedUser?.nChips) || 0,
    difficulty: session.eDifficulty,
    made21,
    message: made21 ? `21! You won ${rewardAmount} chips` : 'No reward this time',
    multiplier,
    rewardAmount,
    success: true,
  };
}

async function getWeeklyLeaderboard({ difficulty, limit = 24 } = {}) {
  if (difficulty) {
    assertDifficulty(difficulty);
  }

  const { end, start } = getWeekRange();
  const query = {
    dWeekStartDate: start,
    ...(difficulty ? { eDifficulty: difficulty } : {}),
  };
  const entries = await QUAKEWeeklyLeaderboard.find(query)
    .sort({
      nTotalQUAKEChipsWon: -1,
      nSuccessful21Count: -1,
      nBestSingleWin: -1,
    })
    .limit(limit)
    .lean();

  return {
    entries: entries.map(serializeWeeklyEntry),
    prizePreview: QUAKE_WEEKLY_PRIZES,
    weekEndDate: end,
    weekStartDate: start,
  };
}

async function getLegacyLeaderboard(limit = 24) {
  const runs = await QUAKERun.find({})
    .sort({ nAdjustedScore: -1, nLinesCompleted: -1, dCreatedDate: -1 })
    .limit(limit)
    .lean();

  return runs.map(toLeaderboardEntry);
}

async function saveLegacyRun(user, payload) {
  assertDifficulty(payload?.difficulty || 'easy');
  if (!['board-sealed', 'bust', 'timeout'].includes(payload?.result)) {
    const error = new Error('Invalid QUAKE run result.');
    error.statusCode = 400;
    throw error;
  }

  const run = await QUAKERun.create({
    eDifficulty: payload.difficulty || 'easy',
    eResult: payload.result,
    iUserId: user._id,
    nAdjustedScore: roundChipAmount(payload.adjustedScore),
    nBonusMultiplier: Number(payload.bonusMultiplier) || 1,
    nBuyIn: roundChipAmount(payload.buyIn),
    nLinesCompleted: Math.max(0, Number(payload.linesCompleted) || 0),
    nScore: roundChipAmount(payload.score),
    nSpareSeconds: Math.max(0, Number(payload.spareSeconds) || 0),
    nTurns: Math.max(0, Number(payload.turns) || 0),
    sUserName: user.sUserName || 'Player',
  });

  return toLeaderboardEntry(run);
}

async function getQUAKEProfile(user) {
  const [recentRuns, stats] = await Promise.all([
    QUAKERun.find({ iUserId: user._id })
      .sort({ dCreatedDate: -1 })
      .limit(10)
      .lean(),
    QUAKERun.aggregate([
      { $match: { iUserId: user._id } },
      {
        $group: {
          _id: null,
          bestAdjustedScore: { $max: '$nAdjustedScore' },
          bestLinesCompleted: { $max: '$nLinesCompleted' },
          totalRuns: { $sum: 1 },
          totalScore: { $sum: '$nScore' },
          wins: {
            $sum: {
              $cond: [{ $eq: ['$eResult', 'board-sealed'] }, 1, 0],
            },
          },
        },
      },
    ]),
  ]);

  return {
    recentRuns: recentRuns.map(toLeaderboardEntry),
    stats: {
      bestAdjustedScore: Number(stats[0]?.bestAdjustedScore) || 0,
      bestLinesCompleted: Number(stats[0]?.bestLinesCompleted) || 0,
      totalRuns: Number(stats[0]?.totalRuns) || 0,
      totalScore: Number(stats[0]?.totalScore) || 0,
      wins: Number(stats[0]?.wins) || 0,
    },
  };
}

async function payWeeklyLeaderboardPrizes() {
  // TODO: Wire this to a safe scheduled prize payout system before enabling automatic weekly prizes.
  return {
    paid: false,
    prizes: QUAKE_WEEKLY_PRIZES,
  };
}

module.exports = {
  completeGame,
  getDailyStatus,
  getLeaderboard: getLegacyLeaderboard,
  getLegacyLeaderboard,
  getQUAKEProfile,
  getWeeklyLeaderboard,
  payWeeklyLeaderboardPrizes,
  saveLegacyRun,
  startGame,
  toLeaderboardEntry,
};
