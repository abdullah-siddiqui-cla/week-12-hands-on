const express = require('express');
const { auth } = require('../middlewares/auth');
const productController = require('../controllers/productController');

const router = express.Router();

router.use((req, res, next) => {
  console.log('[products router]', req.method, req.originalUrl);
  next();
});

router.use(auth);

// GET /api/products/
router.get('/', productController.index);

// GET /api/products/:id
router.get('/:id', productController.show);

// PATCH /api/products/:id
router.patch('/:id', productController.update);

// DELETE /api/products/:id
router.delete('/:id', productController.destroy);

module.exports = router;
