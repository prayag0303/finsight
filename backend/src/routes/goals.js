const express = require('express');
const router = express.Router();
const { getGoals, createGoal, updateGoal, deleteGoal, addContribution, getGoalCalculations } = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.post('/:id/contribute', addContribution);
router.get('/:id/calculations', getGoalCalculations);

module.exports = router;
