const express = require('express');
const router = express.Router();
const { getReports, getReport, generateReport, deleteReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getReports);
router.post('/generate', generateReport);
router.get('/:id', getReport);
router.delete('/:id', deleteReport);

module.exports = router;
