# Week 12 Hands-On (Extension): Authentication & Authorization

Continue from your **Express + MongoDB + Mongoose** API (`solution/` is a reference implementation). This week you add **authentication** (who you are) and **authorization** (what you are allowed to do): hashing passwords, issuing JWTs on login, and locking routes behind middleware.

You will work in **3 parts**:

1. Hash passwords before saving users + add a `role` field  
2. Login endpoint that returns a signed JWT  
3. Middleware to protect routes by login and by role  

---

## Prerequisites

- Working API from the MongoDB hands-on (models, routers, services)
- Postman (or curl) for testing
- Packages you will need (install what your approach uses):

```bash
npm install dotenv jsonwebtoken bcrypt
```

Use **`bcrypt`** for passwords: it salts and hashes for you, and **`bcrypt.compare`** handles verification at login. Prefer the **async** API (`bcrypt.hash` / `bcrypt.compare`) so you do not block the event loop.

---

## Environment variables

Add to **`.env`** (keep out of git):

- `JWT_SECRET` — long random string used only to sign and verify JWTs  
- Existing vars such as `PORT`, `MONGODB_URI` stay as they are  

Load secrets with **`dotenv`** where you read `process.env`.

---

## Part 1 — Hash passwords and add `role`

**Goals:** Never store plain-text passwords. Extend the user model so each user has a role.

### Model

- Add **`role`** to the **User** schema.  
  - Allowed values: **`customer`** or **`admin`**  
  - Choose a sensible default for new users (for example **`customer`**)

### Service layer

- Add a **`jwtService`** module (name from this exercise; it will hold **JWT helpers in Part 2** and can also export **password helpers** used here).  
  - Implement **`hashPassword(plainText)`** using **`bcrypt.hash`** (pick a **cost** / salt rounds value—**10** is a common starting point). Store the returned string as **`password`** in MongoDB.  
  - For login you will use **`bcrypt.compare(plainText, storedHash)`** (you can add a **`comparePassword`** helper next to **`hashPassword`**).

### `createUser` flow

- In **`userService`** (around **`createUser`**), **hash** the password from the request payload **before** calling **`User.create`**.  
- Do **not** persist the plain password.  
- Keep handling duplicate username (**Mongo duplicate key / code `11000`**) as you already do.

**Checkpoint:** Creating a user stores a hashed password in MongoDB; `role` is present and validated; duplicate username still returns a clear **409**-style error.

---

## Part 2 — Login and JWT

**Goals:** Verify credentials and respond with a **signed JWT** the client can send on later requests.

### Router / controller / service

- Add an **`auth`** router (for example mounted at **`/auth`**).  
- **`POST /auth/login`** — JSON body: **`username`**, **`password`**  
  - Look up the user by username.  
  - Compare the submitted password with the stored hash using **`bcrypt.compare`**.  
  - On success: build a JWT payload with at least **`userId`** (or **`sub`**) and **`role`** (and optionally **`username`**).  
  - Sign the token with **`jwt`** (**`jsonwebtoken`**) using **`JWT_SECRET`** from the environment.  
  - Return JSON such as **`{ token }`** (and optionally basic user info **without** the password hash).  
  - On wrong credentials: respond with **401** (do not reveal whether the username exists).

Put verification/sign helpers in **`jwtService`** (for example **`signToken(payload)`**, **`verifyToken(token)`**).

**Checkpoint:** Valid login returns a JWT; invalid login returns **401**; secret is read from **`.env`**, not hard-coded.

---

## Part 3 — Protect routes (auth + authorization)

**Goals:** Some routes need a **valid JWT**. Different routes need **different roles**.

### Middleware

1. **`authenticate`** (or similar)  
   - Read the JWT from the **`Authorization`** header using the usual **`Bearer <token>`** shape (if missing or malformed → **401**).  
   - Verify with **`jwtService`**.  
   - Attach **`req.user`** (or **`req.auth`**) with **`userId`** and **`role`** so downstream handlers and middleware can use them.

2. **`authorizeRoles(...allowedRoles)`**  
   - After **`authenticate`**, allow the request only if **`req.user.role`** is in **`allowedRoles`**; otherwise **403 Forbidden**.

### Apply to your existing API

Mount middleware on your existing routers in **`app.js`** (or on specific routes—be consistent):

| Area | Who may access |
| --- | --- |
| **`/products`** and **`/categories`** | Logged-in user whose **`role`** is **`customer`** |
| **`/users`** routes **except** **`POST /users/:id/order`** | Logged-in user whose **`role`** is **`admin`** |
| **`POST /users/:id/order`** | Logged-in user whose **`role`** is **`customer`** |

**Notes:**

- **Auth routes** such as **`POST /auth/login`** stay **public** (no JWT required).  
- Health checks or static files can stay public unless you decide otherwise.  
- **`POST /users/:id/order`** is the **only** **`/users`** route for **`customer`** in this spec; wire it with **`authenticate`** + **`authorizeRoles('customer')`** (or equivalent), separate from the **`admin`** stack on the rest of the **`users`** router.

**Checkpoint:** Without a token, **`/products`**, **`/categories`**, and **`/users`** (including **`POST .../order`**) are blocked (**401**). With a **customer** token, **`/products`** and **`/categories`** work; **`POST /users/:id/order`** works; all **other** **`/users`** routes return **403**. With an **admin** token, **non-order** **`/users`** routes work; **`/products`**, **`/categories`**, and **`POST /users/:id/order`** return **403**.

---

## Testing tips (Postman)

- Store **`{{token}}`** in an environment variable after login.  
- On protected requests, set header **`Authorization`**: **`Bearer {{token}}`**.  
- Create at least one **`admin`** user and one **`customer`** user (via seed script, temporary route, or Compass) so you can test admin **`/users`** CRUD and customer **`POST /users/:id/order`** paths.

---

## Bonus ideas

- Integrate login from your React/Next.js client and send the JWT on API calls  
