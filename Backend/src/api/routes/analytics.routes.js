const express = require('express');
const router = express.Router();
const { getIndexTrend } = require('../../services/indexEngine.service');
const { getAnomalies } = require('../../services/anomalyDetection.service');
const { 
  getLeadTimeCurve, 
  getLeadTimeCheckpoints, 
  getLeadTimeCompare 
} = require('../../services/leadTimeAnalysis.service');

router.get('/index-trend', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days || '30', 10);
    const trend = await getIndexTrend(days);
    res.json(trend);
  } catch (err) {
    next(err);
  }
});

router.get('/lead-time', async (req, res, next) => {
  try {
    const routeCode = req.query.route || null;
    const curve = await getLeadTimeCurve(routeCode);
    res.json(curve);
  } catch (err) {
    next(err);
  }
});

router.get('/lead-time/checkpoints', async (req, res, next) => {
  try {
    const checkpoints = await getLeadTimeCheckpoints();
    res.json(checkpoints);
  } catch (err) {
    next(err);
  }
});

router.get('/lead-time/compare', async (req, res, next) => {
  try {
    const routesParam = req.query.routes;
    const routes = routesParam ? routesParam.split(',').map(r => r.trim()).filter(Boolean) : [];
    const comparison = await getLeadTimeCompare(routes);
    res.json(comparison);
  } catch (err) {
    next(err);
  }
});

router.get('/anomalies', async (req, res, next) => {
  try {
    const anomalies = await getAnomalies();
    res.json(anomalies);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
