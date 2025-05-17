const express = require('express');
const { 
  getServices, 
  getServiceById, 
  createService, 
  updateService, 
  deleteService 
} = require('../controllers/serviceController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);

// Protected routes - Provider only
router.post('/', protect, restrictTo('provider'), createService);
router.put('/:id', protect, restrictTo('provider'), updateService);
router.delete('/:id', protect, restrictTo('provider'), deleteService);

module.exports = router;
