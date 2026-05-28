# Admin Panel — Node.js Backend Implementation Plan

## Overview

A server-side-rendered admin web panel mounted at `/admin` inside the existing Express app. It shares the MongoDB connection and all existing models. Auth is session-based (separate from the existing JWT API auth). All existing `/api/*` and `/auth` routes are completely untouched.

---

## 1. Packages to Install

```bash
yarn add express-session connect-mongo ejs csurf
```

| Package | Purpose |
|---|---|
| `express-session` | Server-side session management |
| `connect-mongo` | Stores sessions in the existing MongoDB connection so sessions survive restarts on Render |
| `ejs` | Server-side template engine |
| `csurf` | CSRF token middleware (protects all admin form POSTs) |

Note: `bcryptjs` is already in `dependencies` — no extra install needed for password comparison.

---

## 2. New Files to Create

```
views/
  admin/
    layout.ejs              # Shared HTML shell (navbar, sidebar, <head>)
    login.ejs               # Login form
    users/
      index.ejs             # Paginated users table
      detail.ejs            # Single user detail + actions

controllers/
  admin.controller.js       # All admin page handlers (named function exports)

routes/
  admin.routes.js           # Express Router for /admin/*

middlewares/
  admin-auth.middleware.js  # Session guard for all /admin/* except /admin/login
```

---

## 3. Existing Files to Modify

| File | Change |
|---|---|
| `models/server.js` | Register EJS engine, add session middleware, mount admin router |
| `public/index.html` | Replace content with a meta-refresh redirect to `/admin` |
| `.env.example` | Add `SESSION_SECRET` and `ADMIN_SESSION_NAME` |

---

## 4. Environment Variables

Add to `.env.example` (and to the real `.env`):

```
# Admin Panel Session
SESSION_SECRET=change_this_to_a_long_random_string
ADMIN_SESSION_NAME=makerslab_admin_sid
```

`SESSION_SECRET` must be at least 32 random characters. In production, generate it with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

`SESSION_SECRET` should also be added to the required-config validation list in `config/app.config.js` when `NODE_ENV === 'production'`.

---

## 5. `models/server.js` Changes

### 5a. New requires at the top (alongside existing route requires)

```javascript
const session = require('express-session');
const MongoStore = require('connect-mongo');
const adminRoutes = require('../routes/admin.routes');
```

### 5b. Inside `middlewares()` — add AFTER `helmet()` but BEFORE the API rate limiter

The session middleware must be registered before the admin router. Place it right after `this.app.use(helmet(...))` (with the modified helmet call — see Section 9 on CSP) and before `this.app.use(rateLimiter)`:

```javascript
// View engine for admin panel
this.app.set('view engine', 'ejs');
this.app.set('views', path.join(__dirname, '../views'));

// Session store (shared MongoDB connection — wait for Mongoose to connect first)
this.app.use(session({
  name: process.env.ADMIN_SESSION_NAME || 'makerslab_admin_sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB,
    collectionName: 'admin_sessions',
    ttl: 8 * 60 * 60,          // 8 hours in seconds
    autoRemove: 'native',
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours in ms
  },
}));
```

Important: `resave: false` and `saveUninitialized: false` are required to avoid creating a session record for every API request. The session cookie is scoped to the browser; API clients (Flutter app) never send it, so API routes are unaffected.

### 5c. Inside `routes()` — add after the existing route registrations

```javascript
this.app.use('/admin', adminRoutes);
```

Place this last among all route registrations so the catch-all static-file handler (`express.static("public")`) registered in `middlewares()` is not shadowed.

Also add a root redirect (after the `express.static` call but before all API routes):

```javascript
this.app.get('/', (req, res) => res.redirect('/admin'));
```

---

## 6. `middlewares/admin-auth.middleware.js`

This file exports two named functions.

### `requireAdminSession`

Guards every `/admin/*` route except `/admin/login` and `/admin/logout`. Logic:

1. If `req.session.adminUser` exists, call `next()`.
2. Otherwise redirect to `/admin/login`.

```javascript
const requireAdminSession = (req, res, next) => {
  if (req.session && req.session.adminUser) {
    return next();
  }
  return res.redirect('/admin/login');
};
```

### `requireAdminRole`

Used inside `admin.controller.js` after session login to verify the authenticated user's role is `ADMIN_ROLE` or `SUPER_ROLE`. This is a secondary guard called during the POST `/admin/login` handler — it does NOT need to be a route middleware because role is validated before the session is created.

Internally it checks `user.role.name` (after `.populate('role')`). The role name constants come from `config/constants.js` (`ADMIN_ROLE`, `SUPER_ROLE`).

```javascript
const isAdminRole = (roleName) => {
  const { ADMIN_ROLE, SUPER_ROLE } = require('../config/constants');
  return roleName === ADMIN_ROLE || roleName === SUPER_ROLE;
};
```

Both exports in `module.exports = { requireAdminSession, isAdminRole }`.

---

## 7. `routes/admin.routes.js`

```javascript
const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const csurf = require('csurf');
const { requireAdminSession } = require('../middlewares/admin-auth.middleware');
const ctrl = require('../controllers/admin.controller');

const router = Router();
const csrfProtection = csurf({ cookie: false }); // uses session store, not a separate cookie

// Public routes (no session required)
router.get('/login', csrfProtection, ctrl.getLogin);
router.post('/login', csrfProtection, [
  body('email', 'Email requerido').isEmail().normalizeEmail(),
  body('password', 'Password requerido').not().isEmpty(),
], ctrl.postLogin);

router.post('/logout', requireAdminSession, csrfProtection, ctrl.postLogout);

// Protected routes (session guard applied to all below)
router.use(requireAdminSession);
router.use(csrfProtection);

router.get('/', ctrl.getDashboard);                          // redirects to /admin/users
router.get('/users', ctrl.getUsersList);
router.get('/users/:id', ctrl.getUserDetail);
router.post('/users/:id/toggle-status', ctrl.postToggleUserStatus);
router.post('/users/:id/delete', ctrl.postDeleteUser);
router.post('/users/:id/change-role', ctrl.postChangeUserRole);
router.post('/users/:id/reset-password', ctrl.postResetPassword);

module.exports = router;
```

Key decisions:
- `csurf({ cookie: false })` stores the CSRF secret in the session (already available). No extra cookie.
- Every destructive POST gets CSRF protection automatically via `router.use(csrfProtection)` applied to all protected routes.
- The login POST also gets CSRF to prevent login CSRF (session fixation vector).

---

## 8. `controllers/admin.controller.js`

All functions are `async (req, res)`. No business logic in views — all data fetching here.

### `getLogin`
Renders `views/admin/login.ejs`. Passes `{ csrfToken: req.csrfToken(), error: null }`.

### `postLogin`
1. Run `validationResult(req)` — if errors, re-render login with error message.
2. `userModel.findOne({ email, deleted: false }).populate('role')`.
3. If no user or `!user.status` → re-render login with error (use a generic message: "Invalid credentials" — do not reveal which field failed).
4. `bcryptjs.compareSync(password, user.password)` — if false → same generic error.
5. Call `isAdminRole(user.role.name)` → if false → render login with "Access denied: insufficient role".
6. **Session fixation prevention**: call `req.session.regenerate(callback)` before writing to the session.
7. Inside the regenerate callback: set `req.session.adminUser = { id: user._id.toString(), name: user.name, email: user.email, role: user.role.name }`.
8. Redirect to `/admin/users`.

### `postLogout`
`req.session.destroy(() => res.redirect('/admin/login'))`.

### `getDashboard`
`res.redirect('/admin/users')`.

### `getUsersList`
1. Parse `page` (default 1) and `page_size` (default 20) from `req.query`.
2. Parse optional `search` from `req.query.search`.
3. Build query: `{ deleted: false }`. If `search`, add `$or` on `name` and `email` using case-insensitive regex (same pattern as `users.controller.js`).
4. `.find(query).populate('role').skip(skip).limit(pageSize).sort({ createdAt: -1 })`.
5. `countDocuments(query)` for pagination metadata.
6. Fetch all roles for the filter dropdown: `roleModel.find({ deleted: false, status: true })`.
7. Render `views/admin/users/index.ejs` with `{ users, roles, page, pageSize, totalItems, totalPages, search, csrfToken: req.csrfToken(), adminUser: req.session.adminUser }`.

### `getUserDetail`
1. Validate `id` is a valid ObjectId (use `mongoose.isValidObjectId(id)`) — if not, `res.status(400).render(...)` or redirect with flash-like query param.
2. `userModel.findOne({ _id: id, deleted: false }).populate('role')` — 404 if null.
3. Fetch all roles: `roleModel.find({ deleted: false, status: true })`.
4. Render `views/admin/users/detail.ejs` with user, roles, csrf token, flash message from `req.query.msg` (simple query-param-based flash — no separate flash package needed).

### `postToggleUserStatus`
1. `userModel.findByIdAndUpdate(id, [{ $set: { status: { $not: '$status' } } }], { new: true })`.
2. Redirect to `/admin/users/:id?msg=Status+updated`.

### `postDeleteUser`
1. Soft delete: `userModel.findByIdAndUpdate(id, { deleted: true, status: false })`.
2. Redirect to `/admin/users?msg=User+deleted`.

### `postChangeUserRole`
1. Parse `roleId` from `req.body`.
2. Confirm role exists: `roleModel.findOne({ _id: roleId, deleted: false, status: true })` — 404 if not.
3. `userModel.findByIdAndUpdate(id, { role: roleId })`.
4. Redirect to `/admin/users/:id?msg=Role+updated`.

### `postResetPassword`
1. `userModel.findOne({ _id: id, deleted: false })`.
2. Generate a random 6-digit OTP: `Math.floor(100000 + Math.random() * 900000).toString()`.
3. Hash the OTP with bcrypt and save it as the new password: `user.password = bcrypt.hashSync(otp, bcrypt.genSaltSync())`.
4. Set `user.phoneVerificationCode = otp` and `user.phoneVerificationCodeExpiresAt = new Date(Date.now() + 300000)`.
5. `await user.save()`.
6. Fire notifications in parallel with `Promise.allSettled`:
   - If user has a phone: `sendOtp(user.phone, otp)` from `services/twilioService.js`.
   - If user has an email: Use `sendNotificationEmail` from `helpers/email-notifications.helper.js` with subject "Password Reset" and a message containing the OTP. Note: `sendNotificationEmail` sends to `MAIL_RECIPIENTS` (admin list), not to the user. For sending to the user, construct a separate transporter call using the same SMTP2GO credentials — or accept that the current helper is admin-facing and document this limitation clearly.
7. Redirect to `/admin/users/:id?msg=Password+reset+sent`.

Important note on password reset email: The existing `sendNotificationEmail` in `helpers/email-notifications.helper.js` sends to `process.env.MAIL_RECIPIENTS` (the admin list), not to the target user. The SMS via `sendOtp` goes to the user's phone. If an email direct to the user is required, a second helper function `sendPasswordResetEmail(toAddress, otp)` should be added to `helpers/email-notifications.helper.js` (scope of a separate task). For the initial implementation, plan to send SMS to user + email notification to admin list.

---

## 9. Helmet CSP Conflict

The existing `this.app.use(helmet())` call in `Server.middlewares()` applies a restrictive Content-Security-Policy by default. EJS-rendered admin pages load Bootstrap CSS/JS from CDN, inline styles in `<style>` tags, and inline `<script>` blocks — all of which are blocked by Helmet's default CSP.

### Solution: Use `helmet()` with a path-aware CSP override

Replace the current single `this.app.use(helmet())` with two separate registrations:

```javascript
// 1. API routes: strict Helmet with default CSP (no changes)
this.app.use(/^\/(api|auth|health|info)/, helmet());

// 2. Admin panel and root: Helmet with relaxed CSP for browser rendering
this.app.use('/admin', helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",   // Bootstrap JS
        "'nonce-REPLACE_WITH_NONCE'", // for inline scripts — see nonce approach below
      ],
      styleSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",   // Bootstrap CSS
        "'unsafe-inline'",            // needed for EJS inline styles
      ],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  // Keep all other Helmet protections: HSTS, X-Frame-Options, etc.
}));
```

Alternative (simpler but less strict): Disable CSP only for `/admin` routes using `helmet({ contentSecurityPolicy: false })` as a per-path middleware. This is acceptable given the admin panel is a private internal tool, not public-facing.

Recommended approach for the admin panel specifically: use `'unsafe-inline'` for `styleSrc` (Bootstrap requires it) and load all JS from CDN without inline scripts. Avoid `'unsafe-eval'` entirely.

No changes needed to the `this.app.use(helmet())` protecting `/api/*` routes.

---

## 10. CSRF Protection Details

`csurf` is already listed as a package to install. Implementation notes:

- Uses `{ cookie: false }` mode so the CSRF secret is stored in `req.session._csrf` (no extra cookie to manage).
- Every EJS form must include a hidden field: `<input type="hidden" name="_csrf" value="<%= csrfToken %>">`.
- The `csrfToken` variable must be passed from every controller render call via `csrfToken: req.csrfToken()`.
- On CSRF error, `csurf` throws an error with `err.code === 'EBADCSRFTOKEN'`. Add an error handler in `admin.routes.js` after all route definitions:

```javascript
// CSRF error handler — must be the last middleware in this router
router.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).render('admin/login', {
      error: 'Session expired or invalid request. Please try again.',
      csrfToken: req.csrfToken ? req.csrfToken() : '',
    });
  }
  next(err);
});
```

---

## 11. Session Fixation Prevention

In `postLogin`, after successful credential and role verification, regenerate the session ID before writing the admin user to the session:

```javascript
req.session.regenerate((err) => {
  if (err) return res.status(500).render('admin/login', { error: 'Session error', csrfToken: '' });
  req.session.adminUser = { id: ..., name: ..., email: ..., role: ... };
  req.session.save((saveErr) => {
    if (saveErr) return res.status(500).render('admin/login', { error: 'Session error', csrfToken: '' });
    res.redirect('/admin/users');
  });
});
```

`req.session.regenerate()` creates a new session ID, invalidating any pre-auth session the attacker may have planted.

---

## 12. EJS Views Structure

The views live in `/views/admin/` (relative to project root). The `views` directory is a new top-level directory alongside `controllers/`, `routes/`, etc.

### `views/admin/layout.ejs`

A partial include pattern (EJS does not have layout inheritance natively — use `<%- include('../partials/header') %>` at the top and `<%- include('../partials/footer') %>` at the bottom, or inline the full shell in each view). Given there are only 3 page templates, inlining the shell in each view is simpler and avoids a dependency on `express-ejs-layouts`.

Each view includes:
- Bootstrap 5.3 from CDN (jsDelivr): `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css`
- Bootstrap JS bundle: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js`
- A top navbar showing logged-in admin name and a logout button (POST form with CSRF token)

### `views/admin/login.ejs`

- Centered card layout
- Two fields: Email, Password
- Submit button
- Error message display (`<% if (error) { %>`)
- CSRF hidden field

### `views/admin/users/index.ejs`

- Search form (GET, no CSRF needed for GET)
- Table columns: Name, Phone, Email, Role, Status (badge), Created At, Actions
- Actions per row: "View" link to detail page
- Pagination controls (previous/next links with `?page=` query param)
- Flash message display from `req.query.msg`

### `views/admin/users/detail.ejs`

- Read-only display of all user fields (name, email, phone, role, status, google, createdAt, updatedAt)
- User avatar `<img>` using `user.image`
- Form 1: Change Role — `<select>` of all roles + submit (POST `/admin/users/:id/change-role`)
- Form 2: Toggle Status — single button showing current state (POST `/admin/users/:id/toggle-status`)
- Form 3: Soft Delete — button with a confirmation data attribute (POST `/admin/users/:id/delete`)
- Form 4: Reset Password — button with confirmation (POST `/admin/users/:id/reset-password`)
- All forms include CSRF hidden field
- Flash message display from `req.query.msg`
- Back link to `/admin/users`

---

## 13. `public/index.html` Replacement

Replace the entire content of `/public/index.html` with a simple meta-refresh redirect. The static file is served by `express.static("public")` before any route matching, so this takes effect for `GET /`.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0; url=/admin" />
    <title>Redirecting...</title>
  </head>
  <body>
    <p><a href="/admin">Click here if not redirected</a></p>
  </body>
</html>
```

Alternative: Remove the redirect from `public/index.html` and instead add `this.app.get('/', (req, res) => res.redirect('/admin'))` in `Server.routes()` before the `express.static` call. This is cleaner because it uses Express routing instead of relying on static file content. Prefer this approach — modify `public/index.html` to a simple stub and add the Express redirect.

---

## 14. API Endpoint Specification (Admin Panel Routes)

All routes render HTML (EJS). None return JSON. They are not part of the REST API.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/login` | None | Render login form |
| POST | `/admin/login` | None | Process credentials, create session |
| POST | `/admin/logout` | Session | Destroy session, redirect to login |
| GET | `/admin` | Session | Redirect to `/admin/users` |
| GET | `/admin/users` | Session | Paginated user list with search |
| GET | `/admin/users/:id` | Session | User detail page |
| POST | `/admin/users/:id/toggle-status` | Session | Toggle `status` boolean |
| POST | `/admin/users/:id/delete` | Session | Soft-delete (set `deleted: true`) |
| POST | `/admin/users/:id/change-role` | Session | Update user's role ObjectId |
| POST | `/admin/users/:id/reset-password` | Session | Generate OTP, send SMS+email |

Query parameters for GET `/admin/users`: `page` (integer, default 1), `page_size` (integer, default 20, max 100), `search` (string).

---

## 15. Validation Rules

### POST `/admin/login`
- `email`: required, must pass `isEmail()`, normalize with `normalizeEmail()`
- `password`: required, not empty

Both validated with `express-validator`'s `body()` (same pattern as existing routes but using `body()` instead of `check()` since there are no path params).

### POST `/admin/users/:id/*` (all user action routes)
- `id`: validate with `mongoose.isValidObjectId(req.params.id)` at the top of each controller function — return 400 or redirect with error query param if invalid.

### POST `/admin/users/:id/change-role`
- `roleId` from body: required, must be a valid Mongo ObjectId. Use `mongoose.isValidObjectId(req.body.roleId)`.

---

## 16. Error Handling Approach

- **404 for admin pages**: If a user or role is not found, redirect to the list page with `?msg=Not+found` rather than rendering a separate 404 template.
- **500 errors**: Catch in try/catch blocks; log with `console.error`; redirect back with `?msg=Server+error`.
- **CSRF errors**: Caught by the `router.use((err, req, res, next) => ...)` error handler in `admin.routes.js`.
- **Session errors** (regenerate/save failures): Render login page with a generic error message.
- **Twilio/email failures** in `postResetPassword`: Use `Promise.allSettled` so a failed SMS does not abort the password update. Log failures but still redirect with success message noting the password was changed.

---

## 17. Security Considerations Summary

| Concern | Mitigation |
|---|---|
| Session fixation | `req.session.regenerate()` called immediately after successful login |
| CSRF | `csurf` middleware on all admin POSTs; token in every form |
| Clickjacking | Helmet's `X-Frame-Options: DENY` remains active (no change needed) |
| Session hijacking | `httpOnly: true`, `sameSite: lax`, `secure: true` in production |
| Brute force on login | Existing `rateLimiter` middleware already applies globally; admin login benefits automatically |
| Role bypass | Role check happens during login before session is created; session stores role name to avoid extra DB call per request |
| Information disclosure | Generic "Invalid credentials" message regardless of whether email or password is wrong |
| Password exposure | OTP sent only via SMS to user's registered phone; hashed immediately in DB |
| XSS via EJS | EJS auto-escapes `<%= %>` output. Use `<%-` only for trusted, pre-sanitized content. `xss-clean` middleware already runs globally |

---

## 18. Integration Points with Existing Code

| Existing asset | Used by |
|---|---|
| `models/user.model.js` | All admin user queries; note `toJSON()` strips `password` and `deleted` — use `.lean()` or access raw document if those fields are needed in the controller |
| `models/role.model.js` | Role dropdown population, role validation |
| `config/constants.js` `ADMIN_ROLE`, `SUPER_ROLE` | `isAdminRole()` in `admin-auth.middleware.js` |
| `services/twilioService.js` `sendOtp` | `postResetPassword` |
| `helpers/email-notifications.helper.js` `sendNotificationEmail` | `postResetPassword` (sends to admin list) |
| `bcryptjs` | Already in dependencies; used in `postLogin` for password comparison and `postResetPassword` for hashing the new OTP |
| `database/config.js` `MONGODB` env var | `MongoStore.create({ mongoUrl: process.env.MONGODB })` |

Important: `userModel.toJSON()` omits `password` and `deleted`. When the admin controller needs to check `deleted` or compare passwords (only in login flow), call `userModel.findOne(...).select('+password +deleted')` or use `.lean()` and access the raw BSON document. In `postLogin`, `findOne({ email, deleted: false })` already filters deleted users correctly; `.populate('role')` is needed to get `role.name`.

---

## 19. File Change Summary (Quick Reference)

**Create (new files):**
- `/views/admin/login.ejs`
- `/views/admin/users/index.ejs`
- `/views/admin/users/detail.ejs`
- `/controllers/admin.controller.js`
- `/routes/admin.routes.js`
- `/middlewares/admin-auth.middleware.js`

**Modify (existing files):**
- `/models/server.js` — add session setup in `middlewares()`, add EJS view engine setup, add `this.app.use('/admin', adminRoutes)` in `routes()`, add root redirect, replace `helmet()` with path-aware CSP configuration
- `/public/index.html` — replace with redirect stub
- `/.env.example` — add `SESSION_SECRET` and `ADMIN_SESSION_NAME`
