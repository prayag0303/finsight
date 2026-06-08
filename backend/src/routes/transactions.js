const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const {
  getTransactions, createTransaction, updateTransaction,
  deleteTransaction, uploadCSV, getStats, getMonthlyTrend, getCategories,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

const txValidation = [
  body('date').isISO8601().withMessage('Invalid date format'),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 200 }),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('type').isIn(['credit', 'debit']).withMessage('Type must be credit or debit'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  next();
};

router.use(protect);

router.get('/', getTransactions);
router.post('/', txValidation, validate, createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);
router.post('/upload', upload.single('file'), uploadCSV);
router.get('/stats/overview', getStats);
router.get('/stats/trend', getMonthlyTrend);
router.get('/categories/list', getCategories);

module.exports = router;
