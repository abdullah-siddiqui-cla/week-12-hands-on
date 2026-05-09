# Week 12 Hands-On (Extension): Express + MongoDB

Extend your existing Express assignment by replacing dummy in-memory data with a real MongoDB database using Mongoose.

You will complete this in 3 phases:

1. DB design + Mongoose modeling
2. Building APIs for data retrieval and CRUD
3. Cleanup requirements in deletion flows

Bonus: Integrate this backend with your previous React/Next.js application.

---

## Prerequisites

- Node.js installed
- Postman / Curl installed
- MongoDB Atlas account + cluster
- Existing Express app structure (`routers/`, `controllers/`, `services/`)

Install required packages:

```bash
npm install mongoose dotenv
```

---

## Getting started

1. Create a MongoDB Atlas database and get your connection string.
2. Add environment variables in `.env`:
   - `PORT=...`
   - `MONGODB_URI=...`
3. In `app.js`, add database connection logic using Mongoose and start the server only after confirming a successful DB connection.

Checkpoint:

- Server starts.
- Mongoose connects successfully.
- You can hit a simple route (like `/health`) while connected.

---

## Phase 1 — DB Design + Mongoose Modeling

Design the data model and create Mongoose schemas in `models/`.

### Requirements

- **Product**
  - `name`
  - `price`
  - `description`
  - belongs to one category
- **Category**
  - `name`
  - `description`
  - has many products
- **User**
  - `username` (unique)
  - `password`
  - `firstname`
  - `lastname`
  - has many orders
- **Order**
  - `created_at` timestamp
  - belongs to one user
  - contains many products
  - each product has only one quantity per order

### Relationship expectations

- Product `->` Category: many-to-one
- Category `->` Products: one-to-many
- User `->` Orders: one-to-many
- Order `->` User: many-to-one
- Order `<->` Product: many-to-many

### Implementation guidance

- Create one model file per entity in `models/`.
- Use proper data types and required validations.
- Add references (`ref`) for linked documents.

Checkpoint:

- All four models compile and are exportable.
- Relations are represented with ObjectId references.
- Unique username is enforced.

---

## Phase 2 — RESTful APIs for CRUD + retrieval

Using your existing structure (`routers/`, `controllers/`, `services/`), build APIs for:

- Product CRUD
  - `GET /products` - Get all products
  - `GET /products/:id` - Get a product
  - `POST /products` - Create a product
  - `PUT /products/:id` - Update a product
  - `DELETE /products/:id` - Deletes a product
- Category CRUD
  - `GET /categories` - Get all categories
  - `GET /categories/:id` - Get a category
  - `POST /categories` - Create a category
  - `PUT /categories/:id` - Update a category
  - `DELETE /categories/:id` - Deletes a category
- User CRUD
  - `GET /users` - Get all users
  - `GET /users/:id` - Get a user
  - `POST /users` - Create a user
  - `PUT /users/:id` - Update a user
  - `DELETE /users/:id` - Deletes a user

Then add these service-level capabilities and update above APIs:

1. **Category with products**
   - Input: category id
   - Output: category payload with `products` key containing all products in that category
   - Use this method inside `GET /categories/:id` to return a category along with its products.

2. **User with orders and products**
   - Input: user id
   - Output: user payload with `orders` key
   - Each order includes its `products`
   - Use this method inside `GET /users/:id` to return a user along with their orders.

3. **Place order**
   - Input: user id + list of product ids
   - Behavior: create an order linked to that user with those products
   - Create `POST /users/:id/order`, define a request payload, and use this service method to place an order.
   - Confirm order creation by calling `GET /users/:id` and checking the `orders` list.

### Implementation guidance

- Keep controllers thin (request parsing, validation, response formatting).
- Keep business logic and DB interaction in services.
- Use Mongoose population where needed to return nested data.
- Return clear HTTP statuses (`200/201/400/404/409` where appropriate).

Checkpoint:

- CRUD endpoints for Product, Category, User work from Postman.
- Retrieval endpoints return nested relational payloads correctly.
- Place-order flow creates linked order records correctly.

---

## Phase 3 — Cleanup requirements (deletion constraints)

Implement these deletion rules:

1. Deleting a user must also delete all of that user’s orders.
2. Deleting a product is blocked if that product is used in any order.
3. Deleting a category is blocked if the category still contains products.

### Implementation guidance

- Add checks in service methods before deletion.
- Return meaningful error responses (e.g. `409 Conflict` for blocked deletes).
- Keep behavior consistent across all deletion endpoints.

Checkpoint:

- Cascading delete works for user -> orders.
- Product/category protection rules are enforced reliably.
- Deletion edge cases are testable in Postman.

---

## Bonus — Integrate with your React/Next.js app + Pagination

Integrate this backend with any React/Next.js frontend from previous weeks:

- Replace dummy JSON calls with this backend’s API calls.
- Ensure CORS is configured correctly for your frontend origin.
- Identify list endpoints that can grow large and add pagination to those APIs.
