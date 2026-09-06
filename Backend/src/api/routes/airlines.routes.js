const express = require('express');
const router = express.Router();
const { 
  getAirlineComparison, 
  getAirlineRouteMatrix, 
  getAirlineIndexTrend 
} = require('../../repositories/airline.repository');

router.get('/comparison', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days || '30', 10);
    const comparison = await getAirlineComparison(days);
    res.json(comparison);
  } catch (err) {
    next(err);
  }
});

router.get('/route-matrix', async (req, res, next) => {
  try {
    const matrix = await getAirlineRouteMatrix();
    res.json(matrix);
  } catch (err) {
    next(err);
  }
});

router.get('/index-trend', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days || '30', 10);
    const trend = await getAirlineIndexTrend(days);
    res.json(trend);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
