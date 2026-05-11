const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { ApiError } = require('../utils/ApiError');

function validateObjectId(id, label = 'resource') {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${label} id`);
  }
}

async function listCategories() {
  return Category.find().sort({ createdAt: -1 });
}

async function getCategoryById(id) {
  validateObjectId(id, 'category');
  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, 'Category not found');
  return category;
}

async function createCategory(payload) {
  return Category.create(payload);
}

async function updateCategory(id, payload) {
  validateObjectId(id, 'category');
  const updated = await Category.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!updated) throw new ApiError(404, 'Category not found');
  return updated;
}

async function deleteCategory(id) {
  validateObjectId(id, 'category');
  const hasProducts = await Product.exists({ category: id });
  if (hasProducts) {
    throw new ApiError(409, 'Cannot delete category that still has products');
  }

  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, 'Category not found');
  return deleted;
}

async function getCategoryWithProducts(id) {
  const category = await getCategoryById(id);
  const products = await Product.find({ category: id }).sort({ createdAt: -1 });

  return {
    ...category.toObject(),
    products,
  };
}

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryWithProducts,
};
