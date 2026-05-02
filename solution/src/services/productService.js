/** In-memory product store (resets when the server restarts). */

let products = [
  { id: 1, name: 'Widget', price: 9.99, description: 'Basic widget' },
  { id: 2, name: 'Gadget', price: 19.5, description: 'Handy gadget' },
];

function listProducts() {
  return [...products];
}

function findProductById(id) {
  return products.find((p) => p.id === id) ?? null;
}

function updateProduct(id, patch) {
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...patch, id };
  return products[idx];
}

function deleteProduct(id) {
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  products.splice(idx, 1);
  return true;
}

module.exports = {
  listProducts,
  findProductById,
  updateProduct,
  deleteProduct,
};
