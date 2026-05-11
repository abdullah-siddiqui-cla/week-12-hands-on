const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { ApiError } = require('../utils/ApiError');

function validateObjectId(id, label = 'resource') {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${label} id`);
  }
}

async function listUsers() {
  return User.find().sort({ createdAt: -1 });
}

async function getUserById(id) {
  validateObjectId(id, 'user');
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

async function createUser(payload) {
  try {
    return await User.create(payload);
  } catch (error) {
    if (error && error.code === 11000) {
      throw new ApiError(409, 'Username already exists');
    }
    throw error;
  }
}

async function updateUser(id, payload) {
  validateObjectId(id, 'user');
  try {
    const updated = await User.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
    if (!updated) throw new ApiError(404, 'User not found');
    return updated;
  } catch (error) {
    if (error && error.code === 11000) {
      throw new ApiError(409, 'Username already exists');
    }
    throw error;
  }
}

async function deleteUser(id) {
  validateObjectId(id, 'user');
  const deletedUser = await User.findByIdAndDelete(id);
  if (!deletedUser) throw new ApiError(404, 'User not found');

  await Order.deleteMany({ user: id });
  return deletedUser;
}

async function getUserWithOrders(id) {
  const user = await getUserById(id);
  const orders = await Order.find({ user: id })
    .populate('products')
    .sort({ created_at: -1 });

  return {
    ...user.toObject(),
    orders,
  };
}

async function placeOrder(userId, productIds) {
  validateObjectId(userId, 'user');
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new ApiError(400, 'productIds must be a non-empty array');
  }

  const normalizedIds = productIds.map((id) => String(id));
  const uniqueIds = [...new Set(normalizedIds)];
  if (uniqueIds.length !== normalizedIds.length) {
    throw new ApiError(400, 'Each product can only appear once per order');
  }

  for (const productId of uniqueIds) {
    validateObjectId(productId, 'product');
  }

  const existingProducts = await Product.find({ _id: { $in: uniqueIds } }).select('_id');
  if (existingProducts.length !== uniqueIds.length) {
    throw new ApiError(404, 'One or more products were not found');
  }

  const order = await Order.create({
    user: userId,
    products: uniqueIds,
  });

  return Order.findById(order._id).populate('products');
}

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserWithOrders,
  placeOrder,
};
