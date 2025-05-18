const defaultRate = parseFloat(process.env.DEFAULT_COMMISSION_RATE || '0.1');

const categoryRates = {
  homecare: parseFloat(process.env.COMMISSION_HOMECARE || defaultRate),
  therapy: parseFloat(process.env.COMMISSION_THERAPY || defaultRate),
};

function getCommissionRate(category) {
  return categoryRates.hasOwnProperty(category)
    ? categoryRates[category]
    : defaultRate;
}

module.exports = { getCommissionRate };
