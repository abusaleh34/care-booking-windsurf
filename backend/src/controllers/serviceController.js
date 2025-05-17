const Service = require('../models/Service');

// Get all services with filtering options
exports.getServices = async (req, res) => {
  try {
    // Build query based on filter parameters
    const queryObj = {};
    
    // Filter by category
    if (req.query.category) {
      queryObj.category = req.query.category;
    }
    
    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      queryObj.price = {};
      if (req.query.minPrice) queryObj.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) queryObj.price.$lte = Number(req.query.maxPrice);
    }
    
    // Filter by location (city)
    if (req.query.city) {
      queryObj['location.city'] = { $regex: req.query.city, $options: 'i' };
    }
    
    // Filter by availability
    if (req.query.day) {
      queryObj['availability.day'] = req.query.day.toLowerCase();
    }
    
    // Filter by active status
    queryObj.isActive = true;
    
    // Text search
    if (req.query.search) {
      queryObj.$text = { $search: req.query.search };
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Execute query with pagination
    const services = await Service.find(queryObj)
      .skip(skip)
      .limit(limit)
      .populate('provider', 'name profileImage')
      .sort(req.query.sort || '-createdAt');
    
    // Get total count for pagination
    const total = await Service.countDocuments(queryObj);
    
    res.json({
      services,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Server error while fetching services' });
  }
};

// Get a single service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name profileImage email phone');
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ message: 'Server error while fetching service' });
  }
};

// Create a new service (providers only)
exports.createService = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      duration,
      location,
      availability,
      images
    } = req.body;
    
    const service = await Service.create({
      name,
      description,
      category,
      price,
      duration,
      provider: req.user.id,
      location,
      availability,
      images: images || []
    });
    
    res.status(201).json(service);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Server error while creating service' });
  }
};

// Update a service (provider only)
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Check if the logged-in user is the service provider
    if (service.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }
    
    // Update fields
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.json(updatedService);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Server error while updating service' });
  }
};

// Delete a service (provider only)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Check if the logged-in user is the service provider
    if (service.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }
    
    await service.remove();
    
    res.json({ message: 'Service removed' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Server error while deleting service' });
  }
};
