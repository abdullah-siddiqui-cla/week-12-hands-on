const categoryService = require('../services/categoryService');

async function index(req, res, next) {
  try {
    const categories = await categoryService.listCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const category = await categoryService.getCategoryWithProducts(req.params.id);
    res.json(category);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.json(category);
  } catch (error) {
    next(error);
  }
}

async function destroy(req, res, next) {
  try {
    const category = await categoryService.deleteCategory(req.params.id);
    res.json({ message: 'Category deleted', category });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  index,
  show,
  create,
  update,
  destroy,
};
