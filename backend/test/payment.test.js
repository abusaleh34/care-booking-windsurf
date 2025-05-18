const assert = require('assert');
const { processPayment } = require('../src/services/paymentService');

(async () => {
  // card method
  const cardResult = await processPayment({ amount: 50, currency: 'USD', method: 'card', cardInfo: {} });
  assert(cardResult.success);

  // e-wallet method
  const walletResult = await processPayment({ amount: 50, currency: 'USD', method: 'e_wallet' });
  assert(walletResult.success);

  // bank transfer method
  const bankResult = await processPayment({ amount: 50, currency: 'USD', method: 'bank_transfer' });
  assert(bankResult.success);

  console.log('payment tests passed');
})();
