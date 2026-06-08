const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTemplates, createTemplate, updateTemplate,
  deleteTemplate, postTransaction, skipDue,
} = require('../controllers/recurringController');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  next();
};

const tmplValidation = [
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('type').isIn(['credit', 'debit']).withMessage('Type must be credit or debit'),
  body('frequency').isIn(['weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid frequency'),
  body('nextDueDate').isISO8601().withMessage('Invalid date'),
];

router.use(protect);

router.get('/', getTemplates);
router.post('/', tmplValidation, validate, createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);
router.post('/:id/post', postTransaction);
router.post('/:id/skip', skipDue);

module.exports = router;
