const express = require('express');
const router = express.Router();

const dashboardRoutes = require('./routes/dashboard.routes');
const routesRoutes = require('./routes/routes.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const airlinesRoutes = require('./routes/airlines.routes');
const dataQualityRoutes = require('./routes/dataQuality.routes');
const healthRoutes = require('./routes/health.routes');

router.use('/dashboard', dashboardRoutes);
router.use('/routes', routesRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/airlines', airlinesRoutes);
router.use('/', dataQualityRoutes);
router.use('/health', healthRoutes);

module.exports = router;
