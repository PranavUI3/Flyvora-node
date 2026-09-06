const express = require('express');
const router = express.Router();
const { getAllRoutes, getRouteRanking, getRouteSummary } = require('../../repositories/route.repository');

router.get('/', async (req, res, next) => {
  try {
    const routes = await getAllRoutes();
    res.json(routes);
  } catch (err) {
    next(err);
  }
});

router.get('/ranking', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days || '30', 10);
    const ranking = await getRouteRanking(days);
    res.json(ranking);
  } catch (err) {
    next(err);
  }
});

router.get('/:route_code/summary', async (req, res, next) => {
  try {
    const routeCode = req.params.route_code;
    const days = parseInt(req.query.days || '30', 10);
    const summary = await getRouteSummary(routeCode, days);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
