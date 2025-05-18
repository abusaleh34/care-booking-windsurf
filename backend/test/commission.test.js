const assert = require('assert');
const { getCommissionRate } = require('../src/config/commission');

// default rate
assert(Math.abs(getCommissionRate('unknown') - 0.1) < 1e-6);

process.env.COMMISSION_HOMECARE = '0.2';
delete require.cache[require.resolve('../src/config/commission')];
const { getCommissionRate: fresh } = require('../src/config/commission');
assert(Math.abs(fresh('homecare') - 0.2) < 1e-6);

console.log('commission tests passed');
