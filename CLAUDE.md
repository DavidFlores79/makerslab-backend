# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Development with nodemon auto-reload
yarn start        # Production start
yarn test-mongo   # Test MongoDB connection
yarn check-deploy # Verify Render deployment status
yarn seed:countries # Seed countries collection
```

No test suite is configured (`yarn test` exits with error). There is no lint script.

## Architecture Overview

**MakersLab** is a non-profit educational backend for a Flutter mobile app that controls Arduino/ESP32 devices via Bluetooth. The server exposes a REST API and an AI-powered chat system.

### Entry Point & Server Bootstrap

`app.js` instantiates `models/server.js` (`Server` class) and calls `listen()`. The `Server` class constructor chains three steps: `conectarDB()` → `middlewares()` → `routes()`. Adding a new resource always requires two edits: the route file + a `this.app.use()` call inside `Server.routes()`.

### Route Prefixes

| Prefix | Purpose |
|---|---|
| `/auth` | Authentication (no JWT required) |
| `/api/{resource}` | All protected API resources |
| `/health`, `/info` | Public status endpoints |

There is **no `/api/v2` versioning** — all routes use `/api/{resource}`.

### Request/Auth Flow

1. `validateJWT` middleware (`middlewares/validar-jwt.middleware.js`) verifies Bearer token, fetches the user document, and attaches it to **`req.user`** (never `req.agent`).
2. `checkPermissions(permissions[])` (`middlewares/permission-validator.middleware.js`) checks the user's role menu against the route and required permission strings.
3. `Validator` (`middlewares/validator.middleware.js`) is appended at the end of `express-validator` check arrays to short-circuit on validation errors.

### Controllers

Controllers export **named functions** (not classes). Pattern:

```javascript
const doSomething = async (req, res) => { ... };
module.exports = { doSomething };
```

Pagination response shape: `{ page, pageSize, totalItems, data }`.  
Single-item shape: `{ data: item }`.  
Mutation shapes: `{ msg: '...', data: item }` or `{ msg: '...' }`.

All queries filter with `{ deleted: false }`. Deletes are **soft** — set `deleted: true`, never call `deleteOne()` directly on user-facing data.

### Routes

Validation is declared inline with `express-validator`'s `check()`:

```javascript
router.post('/', [validateJWT, check('name', 'Required').not().isEmpty(), Validator], controller.fn);
```

### Models

Every model includes `deleted: { type: Boolean, default: false }` and `timestamps: true`. Roles are string constants from `config/constants.js`: `USER_ROLE`, `ADMIN_ROLE`, `SUPER_ROLE`.

### Configuration System

`config/app.config.js` reads env vars into a typed config object and validates required keys in production. `services/configurationService.js` wraps a `node-cache` TTL cache (default 5 min) over a singleton `Configuration` MongoDB document, which can override the env-based defaults at runtime. Always use `configurationService` — not raw env vars — when reading `chatLimits` or `userLimits`.

### AI Chat System

`chatController.js` manages a per-user-per-module `Conversation` document. Each conversation stores a `messages[]` array. Two helpers trim the array before DB writes (`trimMessages`) and before AI calls (`getMessagesForAI`) using limits from `configurationService`.

`services/openAIService.js` — uses `require()` (CommonJS).  
`services/openAIChatService.js` — uses **ESM `import/export`** (anomaly in the codebase; this file is the only ESM module).

Module-specific system prompts are defined in `config/constants.js` under `MODULE_INSTRUCTIONS` (keys: `led_control`, `temperature_sensor`, `joystick_control`, `servo_control`, `default`). Retrieved via `getModuleInstructions(moduleName)`.

Daily message usage is tracked in `UserChatUsage` model via static methods `getTodayUsage(userId)` and `incrementUsage(userId, conversationId)`.

### Services & Helpers

| Path | Responsibility |
|---|---|
| `services/openAIService.js` | OpenAI chat completions (CommonJS) |
| `services/openAIChatService.js` | OpenAI Responses API (ESM — `import/export`) |
| `services/emailService.js` | Nodemailer via SMTP2GO |
| `services/twilioService.js` | Twilio SMS / OTP |
| `services/configurationService.js` | Cached DB config singleton |
| `helpers/jwt.helper.js` | `generateJWT` / `verifyToken` |
| `helpers/email-notifications.helper.js` | Triggered email templates |
| `helpers/uploads.helper.js` | Cloudinary upload logic |
| `helpers/db_validators.helper.js` | Custom `express-validator` validators |

### Security Middleware Stack

Applied globally in `Server.middlewares()`: helmet → compression → cors → body-parser → mongoSanitize → xssClean → hpp → express-fileupload → rateLimiter (60s window, 30 req max by default).

## Key Environment Variables

```
PORT, NODE_ENV, MONGODB
JWT_SECRET, JWT_EXPIRES_IN
OPENAI_API_KEY, OPENAI_MODEL_TEXT (gpt-4o-mini), OPENAI_MODEL_VISION (gpt-4o)
CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
SMTP2GO_HOST, SMTP2GO_PORT, SMTP2GO_USERNAME, SMTP2GO_PASSWORD, SMTP2GO_FROM_NAME
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
GOOGLE_CLIENT_ID, GOOGLE_SECRET_ID
RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX
CHAT_MAX_MESSAGES_IN_DB, CHAT_MAX_MESSAGES_TO_AI, CHAT_MAX_USER_MESSAGES_PER_DAY
```

## Agents

Specialized sub-agents live in `.claude/agents/`:

- **`nodejs-backend-architect`** — plans Node.js/Express features for this codebase; saves output to `.claude/doc/{feature}/nodejs-backend.md`
- **`angular-frontend-developer`** — plans Angular Clean Architecture features; saves to `.claude/doc/{feature}/angular-frontend.md`
- **`qa-criteria-validator`** — defines and validates acceptance criteria with Jasmine/Karma + Playwright; saves to `.claude/doc/{feature}/qa_validation_plan.md`
- **`ui-ux-analyzer`** — captures screenshots via Playwright and provides design feedback

All planning agents propose plans only — they never implement. Context sessions are stored in `.claude/sessions/context_session_{feature_name}.md`.
