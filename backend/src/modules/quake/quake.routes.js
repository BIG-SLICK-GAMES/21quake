const express = require('express');

const { requireAuth } = require('../auth/auth.middleware');
const {
  completeQUAKEGame,
  dailyStatus,
  listLeaderboard,
  saveQUAKERun,
  startQUAKEGame,
  QUAKEProfile,
} = require('./quake.controller');

const router = express.Router();

router.get('/leaderboard', listLeaderboard);
router.get('/daily-status', requireAuth, dailyStatus);
router.get('/profile', requireAuth, QUAKEProfile);
router.post('/start', requireAuth, startQUAKEGame);
router.post('/complete', requireAuth, completeQUAKEGame);
router.post('/run', requireAuth, saveQUAKERun);

module.exports = router;
