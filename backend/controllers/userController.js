import User from '../models/User.js';

/**
 * Get All Users (Admin Only, Optimized for 3000+ users)
 * GET /api/users?page=1&limit=50&role=user
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (role) {
      query.role = role;
    }

    // Lean queries + field selection for performance
    const users = await User.find(query)
      .lean()
      .select('name email phone role isActive profileImage createdAt')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .exec();

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalUsers: total,
        perPage: limitNum,
      },
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get User by ID (Admin Only)
 * GET /api/users/:id
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update User (Admin Only or User themselves)
 * PUT /api/users/:id
 */
export const updateUser = async (req, res, next) => {
  try {
    // Check if user is updating themselves or is admin
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user',
      });
    }

    const fieldsToUpdate = req.body;
    
    // Handle file upload if present
    if (req.file) {
      const apiBaseUrl = process.env.API_URL || 'http://localhost:5000';
      fieldsToUpdate.profileImage = `${apiBaseUrl}/uploads/${req.file.filename}`;
    }
    
    // Don't allow role change unless admin
    if (req.user.role !== 'admin' && fieldsToUpdate.role) {
      delete fieldsToUpdate.role;
    }

    const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate User (Admin Only)
 * PUT /api/users/:id/deactivate
 */
export const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select(
      '-password'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export default { getAllUsers, getUserById, updateUser, deactivateUser };
