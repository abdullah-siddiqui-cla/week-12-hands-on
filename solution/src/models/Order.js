const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
    ],
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

orderSchema.path('products').validate(function validateUniqueProducts(products) {
  const ids = products.map((id) => id.toString());
  return new Set(ids).size === ids.length;
}, 'A product can only appear once in an order');

module.exports = mongoose.model('Order', orderSchema);
