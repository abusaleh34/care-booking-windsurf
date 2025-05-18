const tests = [
  require('./commission.test'),
  require('./distance.test'),
  require('./payment.test')
];

(async () => {
  for (const t of tests) {
    if (t instanceof Promise) {
      await t;
    }
  }
  console.log(`${tests.length} tests executed`);
})();
