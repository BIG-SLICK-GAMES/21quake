const mongoose = require('mongoose');

const QUAKEWeeklyLeaderboardSchema = new mongoose.Schema(
  {
    iUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    sUserName: { type: String, default: 'Player' },
    eDifficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    nTotalQUAKEChipsWon: { type: Number, default: 0, index: true },
    nSuccessful21Count: { type: Number, default: 0, index: true },
    nBestSingleWin: { type: Number, default: 0, index: true },
    nGamesPlayed: { type: Number, default: 0 },
    dWeekStartDate: { type: Date, required: true },
    dWeekEndDate: { type: Date, required: true },
  },
  {
    collection: 'quake_weekly_leaderboards',
    timestamps: { createdAt: 'dCreatedDate', updatedAt: 'dUpdatedDate' },
  }
);

QUAKEWeeklyLeaderboardSchema.index(
  { iUserId: 1, eDifficulty: 1, dWeekStartDate: 1 },
  { unique: true }
);
QUAKEWeeklyLeaderboardSchema.index({
  dWeekStartDate: -1,
  nTotalQUAKEChipsWon: -1,
  nSuccessful21Count: -1,
  nBestSingleWin: -1,
});

module.exports =
  mongoose.models.quake_weekly_leaderboards ||
  mongoose.model('quake_weekly_leaderboards', QUAKEWeeklyLeaderboardSchema);
