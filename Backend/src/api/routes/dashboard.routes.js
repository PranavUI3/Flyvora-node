const express = require('express');
const router = express.Router();
const { getOverviewSummary } = require('../../services/indexEngine.service');

router.get('/overview/summary', async (req, res, next) => {
  try {
    const summary = await getOverviewSummary();
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
