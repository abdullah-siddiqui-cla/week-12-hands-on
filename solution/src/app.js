require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { connectDB } = require('./config/db');

const productsRouter = require('./routers/productsRouter');
const categoriesRouter = require('./routers/categoriesRouter');
const usersRouter = require('./routers/usersRouter');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[app] ${req.method} ${req.path}`);
  next();
});

app.use(express.static(path.join(__dirname, '../public')));


app.post('/api/echo', (req, res) => {
  console.log('POST body:', req.body);
  res.json({ received: req.body });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Week 12 API',
    resources: ['/products', '/categories', '/users'],
  });
});

app.get('/api/error-demo', (req, res, next) => {
  const err = new Error('Demonstration error passed to error-handling middleware');
  err.status = 418;
  next(err);
});

app.use('/products', productsRouter);
app.use('/categories', categoriesRouter);
app.use('/users', usersRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, _next) => {
  console.error('[error]', err.message);
  const status = err.status && Number.isInteger(err.status) ? err.status : 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
  });
});

async function startServer() {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
