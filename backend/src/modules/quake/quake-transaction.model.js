const mongoose = require('mongoose');

const QUAKETransactionSchema = new mongoose.Schema(
  {
    iUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
    iSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QUAKE_sessions',
      index: true,
    },
    eType: {
      type: String,
      enum: ['entry', 'reward', 'weekly-prize'],
      required: true,
    },
    nAmount: { type: Number, required: true },
    eDirection: {
      type: String,
      enum: ['debit', 'credit'],
      required: true,
    },
    sDescription: { type: String, default: '' },
  },
  { collection: 'QUAKE_transactions', timestamps: { createdAt: 'dCreatedDate', updatedAt: 'dUpdatedDate' } }
);

module.exports =
  mongoose.models.QUAKE_transactions ||
  mongoose.model('QUAKE_transactions', QUAKETransactionSchema);
