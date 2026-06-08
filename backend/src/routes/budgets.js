const express = require('express');
const router = express.Router();
const { getBudgets, createBudget, updateBudget, deleteBudget, getBudgetSummary } = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getBudgets);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);
router.get('/summary/overview', getBudgetSummary);

module.exports = router;
