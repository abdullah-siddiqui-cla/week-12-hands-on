# Week 12 Hands-On: Express API Foundations

Build a small HTTP API with Express.js, practice middleware in depth, structure real-world-style code, and exercise your endpoints in Postman. You will implement a **product** resource with **list (index)**, **detail (show)**, **update**, and **delete** actions.

**Prerequisites:** Node.js installed, comfort with JavaScript modules (`import`/`export` or `require`), and familiarity with HTTP verbs and JSON.

---

## Getting started

1. Create a folder for the project and run **`npm init -y`** (or walk through **`npm init`** if you prefer).
2. Install **Express** and **nodemon**:

   ```bash
   npm install express nodemon
   ```

3. In **`package.json`**, add a **`dev`** script that starts your entry file with **nodemon** so the server restarts when you save changes. Point it at your app entry (this hands-on uses **`src/app.js`**):

   ```json
   "scripts": {
     "dev": "nodemon src/app.js"
   }
   ```

   Use **`npm run dev`** while you work. If your entry path differs, update the script accordingly.

---

## Learning goals

- Run an Express application and serve static assets.
- Define routes and compose **app-level** vs **router-level** behavior.
- Use **middleware** intentionally: built-in parsers, CORS, custom logic, error handling, and a **third-party** security middleware (**Helmet**).
- **Validate** incoming data in controllers with **Zod** (Phase 3).
- Split responsibilities across **`routers/`**, **`controllers/`**, and **`services/`**.
- Exercise the API with **Postman**.

---

## Suggested project layout

Organize the server so responsibilities stay clear. A reasonable shape:

```
project-root/
  src/
    app.js              # express app, global middleware, mount routers, listen
    routers/            # route definitions; wire paths to controller functions
    controllers/        # HTTP layer: parse req, call services, send res / next(err)
    services/           # business logic + data access (dummy in-memory data is fine)
    middlewares/        # custom middleware modules (e.g. auth)
  public/               # static files for express.static
  data/                 # optional: JSON seed data if you prefer files over inline arrays
```

You may adjust the entry filename if your tooling expects it, as long as the separation of concerns matches the exercise.

---

## Phase 1 — Express, static files, and routing

**Objectives:** Boot the server, serve static files, and define a few routes so you see request/response flow end to end.

1. **Create** `src/app.js` (if you have not already) and complete **Getting started** so **`npm run dev`** runs your app with nodemon.
2. **Create** an Express application instance and start listening on a port of your choice. For configuration, add the **`dotenv`** package, keep secrets and tunables in a **`.env`** file (and out of version control), and read the port (and anything else you need) via `process.env`.
3. **Static files:** Use Express’s built-in static middleware to serve files from a folder such as `public/`. Place at least one asset there (for example a simple `index.html` or an image) and confirm you can open it in the browser while the server runs.
4. **Routing:** Add a couple of JSON routes (for example a health check like `GET /health` and a placeholder `GET /api` message). Keep handlers small for now; you will refactor in Phase 3.

**Checkpoint:** Server starts without errors; static asset loads in the browser; JSON routes return expected payloads.

---

## Phase 2 — Middleware (all the layers you should know)

**Objectives:** Implement each middleware style in code: built-in parsing, CORS, app-level and router-level stacks, a custom header logger, a central error handler, and Helmet.

Register middleware in a sensible order (body parsers and general security **before** route handlers; **error-handling middleware last**).

1. **Built-in (JSON body parser):** Enable Express’s **`express.json()`** middleware. Add a **`POST`** route that accepts a **JSON** body and **`console.log`** the parsed object from **`req.body`**. Confirm with Postman or curl that the payload arrives as expected.

2. **CORS:** Add the **`cors`** package and configure it so **all origins** are allowed during this exercise (you will restrict this in production). You will rely on this for the Next.js bonus.

3. **App-level middleware:** In **`app.js`**, register middleware that runs for **every** request: log **`req.method`** and the request path (e.g. **`req.path`** or **`req.originalUrl`**—use whichever you prefer), then call **`next()`**.

4. **Router-level middleware:** In **`routers/`**, create a **`products`** router. Add a simple **`GET`** test route on it. On **that router only**, register middleware that logs something identifying **product** traffic (for example a short message or the router’s mount path). Mount the products router from **`app.js`**.

5. **Custom middleware:** In **`middlewares/`**, add a module that exports an **`auth`** middleware: **`console.log`** the **`Authorization`** header on each request where you attach it (if the header is absent, logging **`undefined`** is fine). Apply **`auth`** to the products router or to specific routes—your choice, as long as you can demonstrate it.

6. **Error-handling middleware:** At the **end** of **`app.js`**, after routes, register Express **error-handling middleware** with the four-parameter signature **`(err, req, res, next)`**. From a route or middleware, trigger it with **`next(err)`** and send a **consistent JSON** error body with an appropriate **HTTP status**.

7. **Third-party (Helmet):** Read what **[Helmet](https://helmetjs.github.io/)** does (it sets security-related HTTP headers). Install **`helmet`**, **`use()`** it in **`app.js`** among your app-level middleware.

**Checkpoint:** POST JSON is parsed and logged; CORS allows cross-origin requests; app and products-router logs appear as designed; **`auth`** logs the **`Authorization`** header; **`next(err)`** reaches your error handler; Helmet is active.

---

## Phase 3 — Structure, product API, and Postman

**Objectives:** Implement the product resource using **routers**, **controllers**, and **services**; exercise the full API in **Postman**.

### Product domain

Model a **product** with fields that make sense to you (at minimum include something like `id` and `name`; add price, description, etc. if you like).

**Data:** Keep storage simple—in-memory arrays/objects inside a service module, or load seed data from a `data/` JSON file. No database required.

**Actions to implement:**

| Action | Typical HTTP mapping               | Notes                                                                                         |
| ------ | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| Index  | `GET /api/products`                | Return a list (array) of products.                                                            |
| Show   | `GET /api/products/:id`            | Return one product or a `404`-style response if missing.                                      |
| Update | `PUT` or `PATCH /api/products/:id` | Accept JSON body; update and return the product, or appropriate error if not found / invalid. |
| Delete | `DELETE /api/products/:id`         | Remove the product and confirm with status code or message; handle missing id.                |

**How to build it:**

- Evolve the **`products`** router from Phase 2 (replace or extend the test route) so it exposes **index**, **show**, **update**, and **delete** under **`/api/products`** path, mounted from **`app.js`**.
- For each route action, add an associated **controller** method under `controllers/` (create a controller file if needed). Controllers should stay thin: read from `req`, call the **service**, set status and JSON on `res`, or forward errors with `next(err)`.
- Use **[Zod](https://zod.dev/)** in controllers to **validate** route params and request bodies (especially for **update**) before calling the service. On validation failure, respond with a **400** and a clear message, or pass an error to your error-handling middleware—pick one approach and use it consistently.
- Add a **service** module that holds dummy data and functions the controller calls to perform the work (find all, find by id, update, delete).

Refactor anything left over from Phase 1 so global concerns stay in `app.js` and feature code lives in the folders above.

### Postman

- Create a **collection** for your API with requests for each product action plus your health/static-era routes if still useful.
- Use **environment variables** in Postman for `baseUrl` (e.g. `http://localhost:3000`) so requests stay portable.
- Save example responses where helpful.

**Checkpoint:** All four product actions work from your Postman collection; Zod validation behaves as you designed; the app still runs cleanly with **`npm run dev`**.

---

## Bonus — Connect to your Next.js app

Integrate this backend with the **Next.js application** from the previous hands-on:

- Point your Next.js client requests at this API’s base URL.
- Ensure **CORS** (configured in Phase 2) allows your frontend origin during development.
