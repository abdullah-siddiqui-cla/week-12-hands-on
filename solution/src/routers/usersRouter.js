const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/', userController.index);
router.get('/:id', userController.show);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.destroy);
router.post('/:id/order', userController.placeOrder);

module.exports = router;
