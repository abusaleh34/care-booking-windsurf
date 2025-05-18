const assert = require('assert');
const { calculateDistance } = require('../src/utils/distance');

// distance between same coordinates should be 0
assert(Math.abs(calculateDistance(0,0,0,0)) < 1e-6);

// roughly known distance between Paris (48.8566,2.3522) and London (51.5074,-0.1278)
const d = calculateDistance(48.8566, 2.3522, 51.5074, -0.1278);
assert(d > 340 && d < 350);

console.log('distance tests passed');
