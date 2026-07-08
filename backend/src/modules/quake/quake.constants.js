const QUAKE_EXTRA_GAME_COST = 50;
const QUAKE_FREE_GAMES_PER_DIFFICULTY_DAILY = 3;

const QUAKE_DIFFICULTIES = ['easy', 'medium', 'hard'];

const QUAKE_STARTING_FILLED_TILES = {
  easy: 0,
  medium: 3,
  hard: 6,
};

const QUAKE_MULTIPLIERS = {
  easy: {
    2: 2,
    3: 3,
    4: 4,
    5: 5,
  },
  medium: {
    2: 5.5,
    3: 6,
    4: 6.75,
    5: 7.5,
  },
  hard: {
    2: 8,
    3: 9.5,
    4: 11,
    5: 12.5,
  },
};

const QUAKE_WEEKLY_PRIZES = {
  first: 10000,
  second: 5000,
  third: 2500,
  top10: 500,
};

module.exports = {
  QUAKE_DIFFICULTIES,
  QUAKE_EXTRA_GAME_COST,
  QUAKE_FREE_GAMES_PER_DIFFICULTY_DAILY,
  QUAKE_MULTIPLIERS,
  QUAKE_STARTING_FILLED_TILES,
  QUAKE_WEEKLY_PRIZES,
};
