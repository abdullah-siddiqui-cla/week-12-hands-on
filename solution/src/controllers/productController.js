const productService = require('../services/productService');
async function index(req, res, next) {
  try {
    const products = await productService.listProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const created = await productService.createProduct(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const updated = await productService.updateProduct(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function destroy(req, res, next) {
  try {
    const deleted = await productService.deleteProduct(req.params.id);
    res.json({ message: 'Product deleted', product: deleted });
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
