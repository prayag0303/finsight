const express = require('express');
const router = express.Router();
const { getCashFlowForecast, getAnomalies, getSubscriptions, getRecurring } = require('../controllers/forecastController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/cashflow', getCashFlowForecast);
router.get('/anomalies', getAnomalies);
router.get('/subscriptions', getSubscriptions);
router.get('/recurring', getRecurring);

module.exports = router;
