const mongoose = require('mongoose');

const QUAKEDailyUsageSchema = new mongoose.Schema(
  {
    iUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    sDateKey: { type: String, required: true },
    nEasyUsed: { type: Number, default: 0 },
    nMediumUsed: { type: Number, default: 0 },
    nHardUsed: { type: Number, default: 0 },
  },
  { collection: 'QUAKE_daily_usage', timestamps: { createdAt: 'dCreatedDate', updatedAt: 'dUpdatedDate' } }
);

QUAKEDailyUsageSchema.index({ iUserId: 1, sDateKey: 1 }, { unique: true });

module.exports =
  mongoose.models.QUAKE_daily_usage ||
  mongoose.model('QUAKE_daily_usage', QUAKEDailyUsageSchema);
