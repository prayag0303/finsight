let OpenAI;
try {
  OpenAI = require('openai').default || require('openai');
} catch {
  OpenAI = null;
}

const generateTemplatReport = (data) => {
  const { summary, categoryBreakdown, previousMonth } = data;
  const topCategories = Object.entries(categoryBreakdown || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const highlights = [];
  if (summary.savingsRate > 20) {
    highlights.push({ kind: 'positive', title: 'Excellent Savings Rate', description: `You saved ${summary.savingsRate.toFixed(1)}% of your income this month!` });
  } else if (summary.savingsRate < 10) {
    highlights.push({ kind: 'warning', title: 'Low Savings Rate', description: `Your savings rate is ${summary.savingsRate.toFixed(1)}%. Consider reducing non-essential expenses.` });
  }

  if (topCategories.length > 0) {
    highlights.push({
      kind: 'info',
      title: 'Top Spending Category',
      description: `${topCategories[0][0]} was your highest expense at ₹${topCategories[0][1].toLocaleString('en-IN')}.`,
    });
  }

  const recommendations = [
    {
      priority: 'high',
      title: 'Build Emergency Fund',
      description: 'Aim for 6 months of expenses as emergency savings.',
      impact: `Target: ₹${(summary.totalExpenses * 6).toLocaleString('en-IN')}`,
    },
    {
      priority: 'medium',
      title: 'Review Subscriptions',
      description: 'Check for unused subscriptions you can cancel.',
      impact: 'Potential savings: ₹500–2,000/month',
    },
    {
      priority: 'medium',
      title: 'Increase SIP Contributions',
      description: 'Consider increasing mutual fund SIPs by 10% each year.',
      impact: 'Long-term wealth building',
    },
  ];

  return {
    summary,
    highlights,
    insights: topCategories.map(([cat, amount]) => ({
      category: cat,
      message: `Spent ₹${amount.toLocaleString('en-IN')} on ${cat}`,
      trend: previousMonth?.categoryBreakdown?.[cat]
        ? amount > previousMonth.categoryBreakdown[cat] ? 'up' : 'down'
        : 'neutral',
    })),
    recommendations,
    forecast: {
      nextMonthExpected: Math.round(summary.totalExpenses * 1.02),
      risks: summary.savingsRate < 10 ? ['Low savings may strain finances during emergencies'] : [],
      opportunities: ['Investing surplus in index funds', 'Starting a recurring deposit'],
    },
    aiGenerated: false,
  };
};

const generateAIReport = async (data) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'sk-your-openai-api-key-here' || !OpenAI) {
    return generateTemplatReport(data);
  }

  try {
    const client = new OpenAI({ apiKey });
    const { summary, categoryBreakdown, month, previousMonth } = data;

    const categoryText = Object.entries(categoryBreakdown || {})
      .sort(([, a], [, b]) => b - a)
      .map(([cat, amt]) => `${cat}: ₹${amt.toLocaleString('en-IN')}`)
      .join('\n');

    const prompt = `You are a personal financial advisor. Analyze this financial data for ${month} and provide a comprehensive report.

FINANCIAL SUMMARY:
- Total Income: ₹${summary.totalIncome?.toLocaleString('en-IN')}
- Total Expenses: ₹${summary.totalExpenses?.toLocaleString('en-IN')}
- Net Savings: ₹${summary.netSavings?.toLocaleString('en-IN')}
- Savings Rate: ${summary.savingsRate?.toFixed(1)}%
- Transaction Count: ${summary.transactionCount}

SPENDING BY CATEGORY:
${categoryText}

${previousMonth ? `PREVIOUS MONTH COMPARISON:
- Previous Expenses: ₹${previousMonth.totalExpenses?.toLocaleString('en-IN')}
- Previous Savings Rate: ${previousMonth.savingsRate?.toFixed(1)}%` : ''}

Return a JSON object with exactly this structure:
{
  "highlights": [{"kind": "positive|warning|info", "title": "string", "description": "string"}],
  "insights": [{"category": "string", "message": "string", "trend": "up|down|neutral"}],
  "recommendations": [{"priority": "high|medium|low", "title": "string", "description": "string", "impact": "string"}],
  "forecast": {"nextMonthExpected": number, "risks": ["string"], "opportunities": ["string"]}
}

Provide 3-5 highlights, 3-5 insights, and 3-5 recommendations. Be specific with Indian rupee amounts. Focus on actionable advice.`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.choices[0].message.content);

    return {
      summary,
      ...parsed,
      aiGenerated: true,
      rawAIResponse: response.choices[0].message.content,
    };
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    return generateTemplatReport(data);
  }
};

module.exports = { generateAIReport };
