const userService = require('../services/userService');

async function index(req, res, next) {
  try {
    const users = await userService.listUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const user = await userService.getUserWithOrders(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function destroy(req, res, next) {
  try {
    const user = await userService.deleteUser(req.params.id);
    res.json({ message: 'User deleted', user });
  } catch (error) {
    next(error);
  }
}

async function placeOrder(req, res, next) {
  try {
    const { productIds } = req.body;
    const order = await userService.placeOrder(req.params.id, productIds);
    res.status(201).json(order);
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
  placeOrder,
};
