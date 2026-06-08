const CATEGORY_KEYWORDS = {
  'Food & Dining': [
    'restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonalds', 'mcdonald',
    'pizza', 'burger', 'zomato', 'swiggy', 'food', 'dining', 'bakery',
    'subway', 'kfc', 'dominos', 'dunkin', 'biryani', 'dhaba', 'chai',
    'snack', 'eat', 'meal', 'lunch', 'dinner', 'breakfast', 'tiffin',
    'blinkit', 'zepto', 'bigbasket', 'grocer', 'grocery', 'supermarket',
    'vegetables', 'fruits', 'milk', 'dairy',
  ],
  'Travel': [
    'uber', 'ola', 'lyft', 'taxi', 'cab', 'metro', 'train', 'flight',
    'airport', 'hotel', 'airbnb', 'makemytrip', 'irctc', 'bus', 'rapido',
    'indigo', 'spicejet', 'airlines', 'booking.com', 'goibibo', 'yatra',
    'auto', 'rickshaw', 'toll', 'fuel', 'petrol', 'diesel', 'parking',
    'travel', 'trip', 'railway', 'transport',
  ],
  'Shopping': [
    'amazon', 'flipkart', 'myntra', 'meesho', 'mall', 'shopping', 'store',
    'market', 'walmart', 'target', 'ajio', 'nykaa', 'fashion', 'clothes',
    'shoes', 'accessories', 'electronics', 'gadget', 'mobile', 'laptop',
    'tatacliq', 'reliance', 'dmart', 'decathlon',
  ],
  'Entertainment': [
    'netflix', 'spotify', 'prime', 'hotstar', 'youtube', 'movie', 'cinema',
    'theatre', 'concert', 'disney', 'hulu', 'apple tv', 'zee5', 'sonyliv',
    'mxplayer', 'jiocinema', 'games', 'gaming', 'steam', 'xbox', 'playstation',
    'bookmyshow', 'pvr', 'inox', 'entertainment',
  ],
  'Utilities': [
    'electricity', 'water', 'gas', 'internet', 'wifi', 'broadband', 'mobile',
    'phone', 'recharge', 'bill', 'airtel', 'jio', 'vodafone', 'bsnl', 'tata sky',
    'dth', 'cable', 'utility', 'municipal', 'bescom', 'mseb', 'mahadiscom',
  ],
  'Healthcare': [
    'hospital', 'clinic', 'pharmacy', 'medicine', 'doctor', 'health', 'medical',
    'dental', 'dentist', 'apollo', 'fortis', 'max hospital', 'medplus', 'netmeds',
    'pharmeasy', '1mg', 'lab', 'test', 'xray', 'scan', 'consultation', 'pathology',
    'optician', 'spectacles', 'lens', 'fitness',
  ],
  'Education': [
    'school', 'college', 'university', 'course', 'udemy', 'coursera', 'book',
    'library', 'tuition', 'fee', 'coaching', 'class', 'training', 'certification',
    'byju', 'unacademy', 'vedantu', 'skillshare', 'pluralsight', 'linkedin learning',
    'education', 'study', 'exam',
  ],
  'Rent': [
    'rent', 'lease', 'housing', 'accommodation', 'pg', 'hostel', 'flat',
    'apartment', 'society maintenance', 'maintenance charge',
  ],
  'Insurance': [
    'insurance', 'lic', 'premium', 'policy', 'term insurance', 'health insurance',
    'car insurance', 'bike insurance', 'hdfc life', 'icici lombard', 'star health',
    'max life',
  ],
  'Investments': [
    'mutual fund', 'stock', 'zerodha', 'groww', 'demat', 'sip', 'fd', 'investment',
    'ppf', 'nps', 'elss', 'etf', 'bond', 'nse', 'bse', 'upstox', 'angel broking',
    'smallcase', 'gold', 'recurring deposit',
  ],
  'Salary': [
    'salary', 'wages', 'payroll', 'income', 'stipend', 'ctc', 'monthly pay',
    'payment received', 'credited by employer', 'neft from',
  ],
  'Subscriptions': [
    'subscription', 'monthly plan', 'annual plan', 'renewal', 'auto renew',
  ],
  'Loan Payment': [
    'emi', 'loan', 'mortgage', 'repayment', 'hdfc loan', 'sbi loan', 'home loan',
    'car loan', 'personal loan', 'credit card payment', 'credit card bill',
  ],
};

const normalizeText = (text) => text.toLowerCase().replace(/[^a-z0-9\s]/g, '');

export const categorize = (description) => {
  if (!description || !description.trim()) return '';
  const normalized = normalizeText(description);
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) return category;
    }
  }
  return 'Miscellaneous';
};
