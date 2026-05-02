const { z } = require('zod');
const productService = require('../services/productService');

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const updateBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    price: z.number().nonnegative().optional(),
    description: z.string().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: 'At least one of name, price, or description is required',
  });

function formatZodError(err) {
  if (err instanceof z.ZodError) {
    return err.issues.map((i) => i.message).join('; ');
  }
  return err.message;
}

function index(req, res) {
  const products = productService.listProducts();
  res.json(products);
}

function show(req, res) {
  const parsed = idParamSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ message: formatZodError(parsed.error) });
  }
  const product = productService.findProductById(parsed.data.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
}

function update(req, res) {
  const paramsParsed = idParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    return res.status(400).json({ message: formatZodError(paramsParsed.error) });
  }
  const bodyParsed = updateBodySchema.safeParse(req.body);
  if (!bodyParsed.success) {
    return res.status(400).json({ message: formatZodError(bodyParsed.error) });
  }

  const updated = productService.updateProduct(paramsParsed.data.id, bodyParsed.data);
  if (!updated) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(updated);
}

function destroy(req, res) {
  const parsed = idParamSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ message: formatZodError(parsed.error) });
  }
  const removed = productService.deleteProduct(parsed.data.id);
  if (!removed) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json({ message: 'Product deleted', id: parsed.data.id });
}

module.exports = {
  index,
  show,
  update,
  destroy,
};
