const Service = require('../models/Service');

// @desc    Get all beauty services
// @route   GET /api/services
// @access  Public
const getAllServices = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = category && category !== 'all' ? { category: new RegExp(category, 'i') } : {};

    const services = await Service.find(query).sort({ category: 1, name: 1 }).lean();

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single beauty service by serviceId
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await Service.findOne({
      $or: [{ serviceId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllServices,
  getServiceById,
};
