const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const { ApiError } = require('../utils/ApiError');

function validateObjectId(id, label = 'resource') {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${label} id`);
  }
}

async function listProducts() {
  return Product.find().populate('category').sort({ createdAt: -1 });
}

async function getProductById(id) {
  validateObjectId(id, 'product');
  const product = await Product.findById(id).populate('category');
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
}

async function createProduct(payload) {
  validateObjectId(payload.category, 'category');
  const category = await Category.findById(payload.category);
  if (!category) throw new ApiError(404, 'Category not found');
  return Product.create(payload);
}

async function updateProduct(id, payload) {
  validateObjectId(id, 'product');
  if (payload.category) {
    validateObjectId(payload.category, 'category');
    const category = await Category.findById(payload.category);
    if (!category) throw new ApiError(404, 'Category not found');
  }

  const updated = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate('category');
  if (!updated) throw new ApiError(404, 'Product not found');
  return updated;
}

async function deleteProduct(id) {
  validateObjectId(id, 'product');
  const usedInOrder = await Order.exists({ products: id });
  if (usedInOrder) {
    throw new ApiError(409, 'Cannot delete product that exists in orders');
  }

  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, 'Product not found');
  return deleted;
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
