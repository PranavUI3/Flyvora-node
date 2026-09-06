const express = require('express');
const router = express.Router();
const { getStatus } = require('../../config/database');

router.get('/', (req, res) => {
  const dbStatus = getStatus();
  res.json({
    status: dbStatus.connected ? 'healthy' : 'degraded',
    service: 'flyvora-backend',
    version: '1.0.0',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

module.exports = router;
