# Project Progress & Architecture

## 🚀 Overview
This is a production-grade, highly scalable luxury watch e-commerce REST API built using **Node.js, Express, MongoDB (Mongoose), and Redis (ioredis)**.

## 🏗️ Architectural Decisions
1. **ECMAScript Modules (ESM)**: Strict `import`/`export` syntax using `"type": "module"`.
2. **Class-Based Controllers & Services**: Orchestration is kept clean by keeping logic in singleton Services and HTTP routing in Controllers using arrow functions. We utilized a custom `asyncHandler` wrapper to eliminate repetitive try-catch blocks and omitted `next` parameters for cleaner controller signatures.
3. **Database CQRS (Read/Write Split)**: Mongoose is configured with two distinct connections:
   - `getWriteDB()` for transactions and state modifications.
   - `getReadDB()` for fetching data with a `secondaryPreferred` read preference.
4. **Redis Integration**: Centralized caching and temporary storage managed via `ioredis` with dynamic keys stored in `config/constants.js`.
5. **Centralized Validation**: `Joi` schemas validate all requests via a dedicated middleware.
6. **Robust Error Handling**: Utilizing a custom `CustomError` class that seamlessly feeds into a global Express error-handler. Uncaught exceptions and unhandled rejections cleanly exit the process.

## 🔐 Authentication Flow
- **OTP Verification**: Simulated SMS/WhatsApp dispatcher generates a 6-digit code stored in Redis for 5 minutes (`/send-otp`).
- **Access & Refresh Tokens**: 
  - On successful `/verify-otp`, a short-lived `accessToken` and long-lived `refreshToken` are generated.
  - The `refreshToken` is saved in the database inside the User document and sent as an HTTP-only cookie.
  - The `accessToken` is sent in a standard cookie and JSON response.
  - `POST /refresh-token` validates the HTTP-only cookie against the DB and issues a fresh `accessToken`.
  - Expiration has been manually adjusted in config to 1 day (Access) and 30 days (Refresh).

## 📦 Modules & Features Implemented
### 1. Auth Module (`/api/auth`)
- `POST /send-otp` - Validates phone number and fires OTP.
- `POST /verify-otp` - Validates OTP, handles User upsert, sets cookies.
- `POST /logout` - Nullifies refresh token in DB and clears client cookies.
- `GET /me` - Fetches authenticated user profile.
- `POST /refresh-token` - Validates RT and issues new AT.

### 2. Product Module (`/api/products`)
- `GET /` - Advanced filtering by category, brand, min/max price, and pagination.
- `GET /:sku` - Cache-aside pattern leveraging Redis (1-hour TTL).
- `POST /admin` - Admin-only protected route to create products.

### 3. Order Module (`/api/orders`)
- `POST /create` - Implements **Atomic Inventory Safety** using `$gte` and `$inc` during item checkout to prevent race conditions. Initializes pending orders and prepares payment gateway payloads.

### 4. User Module (`/api/users`)
- `GET /profile` - Retrieve self.
- `POST /address` - Append a new shipping address using `$push`.

### 5. Webhook Module (`/api/webhooks`)
- `POST /payment` - Captures payment completion, simulating signature validation, and transitions order status to `Paid`.
- `POST /shipping` - Updates logistical `trackingStatus` states.

## 🛡️ Security & Middleware
- **Rate Limiting**: Custom limits for global API calls and stricter limits for Authentication.
- **Helmet**: Secures HTTP headers.
- **CORS**: Configured safely for credential sharing.
- **Uploads**: Pre-configured `multer` memory storage for future extensions.

## 📝 Environment Variables (`.env`)
Required structure includes `PORT`, `MONGO_URI_WRITE`, `MONGO_URI_READ`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`, and `FRONTEND_URL`.
