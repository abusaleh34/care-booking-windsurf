/**
 * Payment Service
 * This is a mock implementation of a payment gateway service
 * In a production environment, this would be integrated with a real payment provider like Stripe, PayPal, etc.
 */

// Mock payment process
const processPayment = async (paymentData) => {
  const { amount, currency, cardInfo, customerId } = paymentData;
  
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate payment success/failure based on amount (for testing purposes)
  const isSuccessful = amount <= 1000; // Mock failure for amounts > 1000
  
  if (!isSuccessful) {
    throw new Error('Payment failed. Please try again or use a different payment method.');
  }
  
  // Generate a mock transaction ID
  const transactionId = 'tx_' + Math.random().toString(36).substring(2, 15);
  
  return {
    success: true,
    transactionId,
    amount,
    currency,
    customerId,
    timestamp: new Date(),
    status: 'completed'
  };
};

// Mock payment refund process
const processRefund = async (refundData) => {
  const { transactionId, amount, reason } = refundData;
  
  // Simulate refund processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple validation
  if (!transactionId) {
    throw new Error('Transaction ID is required for refund');
  }
  
  // Generate a mock refund ID
  const refundId = 'rf_' + Math.random().toString(36).substring(2, 15);
  
  return {
    success: true,
    refundId,
    transactionId,
    amount,
    reason,
    timestamp: new Date(),
    status: 'refunded'
  };
};

module.exports = {
  processPayment,
  processRefund
};
