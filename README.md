# QuickKart 🛒

**QuickKart** is a production-ready, full-stack MERN luxury e-commerce platform featuring cryptographic 6-digit email OTP verification, passwordless email login, Razorpay payments, interactive analytics dashboards, order tracking with PDF invoices, dual light/dark themes, and native Gmail SMTP delivery.

---

## 🌟 Key Features

### 🔐 Account Security & OTP Verification
- **6-Digit Registration OTP**: Enforces email verification via cryptographic 6-digit OTP before account activation.
- **Passwordless Email OTP Login**: Sign in securely without a password using an auto-tabbed 6-digit one-time code.
- **Secure Password Reset**: Multi-step verification with 6-digit reset codes and purpose-bound HMAC tokens.
- **Brute-Force & Replay Protection**:
  - Atomic single-use challenge consumption.
  - 5-minute expiration window (`OTP_TTL_MINUTES=5`).
  - 60-second cooldown timer preventing spam/flooding (`OTP_RESEND_COOLDOWN_SECONDS=60`).
  - Maximum attempt locking (5 attempts per challenge).
- **Sensitive Action Re-authentication**: Updating passwords or email addresses requires current password re-authentication and verification.
- **Privacy Masking**: User emails are automatically masked (e.g. `m*******7@gmail.com`) across all verification and OTP screens.

### 🛍️ Customer Experience
- **Luxury UI & Dual Themes**: Obsidian luxury aesthetic with instant dark and light mode toggle (zero FOUC / theme flash on page refresh).
- **Product Catalog**: Real-time search, category filtering, price sorting, and responsive pagination.
- **Product Details**: High-resolution image galleries, customer reviews, ratings, and stock status.
- **Cart & Wishlist**: Persistent shopping cart and wishlist management with instant counter updates.
- **Secure Checkout**: Seamless **Razorpay** checkout supporting Cards, UPI, Netbanking, and Wallets.
- **Order Management & PDF Invoices**: Real-time order status tracking with downloadable PDF tax invoices generated via PDFKit.
- **Mobile Responsive**: Native-like mobile experience with responsive bottom navigation.

### 📊 Admin Management
- **Interactive Analytics & Trends**: 3-tab data visualization using Recharts (Revenue Area Charts, Monthly Sales Bar Charts, and Category Breakdowns).
- **Order Tracking**: Chronologically sorted orders (newest orders appear first) with status badges and quick fulfillment actions.
- **Product Management**: Create, edit, and delete products with automatic Cloudinary image uploading.
- **User Role Management**: Role-based access control (`isAdmin`) protecting admin dashboards and APIs.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Redux Toolkit, React Router v6, Tailwind CSS, Axios, React Hot Toast, Recharts, React Icons |
| **Backend** | Node.js, Express.js (v5), Mongoose (v9), JSON Web Tokens (JWT), bcryptjs, Crypto (HMAC SHA-256) |
| **Database** | MongoDB Atlas (with Mongoose connection pooling for serverless) |
| **Email Delivery** | Nodemailer with native Gmail SMTP (`service: 'gmail'`) & Google App Passwords |
| **Payments** | Razorpay SDK |
| **Cloud Storage** | Cloudinary (Product & asset image hosting) |
| **Document Generation**| PDFKit |
| **Testing** | Node.js native test runner (`node --test`), automated auth & security test suite |
| **Deployment** | Vercel (Frontend & Serverless Backend) |

---

## 📁 Project Structure

```
E-Commerce/
├── backend/
│   ├── config/             # Database connection, email configuration, environment validation
│   ├── controllers/        # Auth, product, cart, order, payment, and admin controllers
│   ├── middleware/         # JWT verification, admin authorization, error handlers
│   ├── models/             # Mongoose schemas: User, Product, Order, OtpChallenge, RateLimit
│   ├── routes/             # RESTful API route definitions
│   ├── scripts/            # CLI utilities (legacy user migration, manual verification)
│   ├── tests/              # 22 automated end-to-end security & auth test cases
│   ├── utils/              # Email delivery service, OTP challenge generator, invoice builder
│   ├── vercel.json         # Vercel serverless deployment configuration
│   └── server.js           # Express application entrypoint
├── frontend/
│   ├── public/             # Static assets, favicon, QuickKart logo
│   ├── src/
│   │   ├── components/     # Navbar, MobileNav, AuthCard, ProductCard, AdminLayout, Loader
│   │   ├── features/       # Redux Toolkit slices (authSlice, cartSlice, wishlistSlice)
│   │   ├── pages/          # Home, Login, Register, VerifyEmail, VerifyResetOtp, Profile, AdminDashboard, etc.
│   │   ├── services/       # Axios API client with silent background polling
│   │   └── utils/          # Toast helpers, email masking, theme evaluators
│   ├── index.html          # HTML template with synchronous inline theme evaluator
│   └── vercel.json         # SPA routing rewrites for Vercel
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
# Server & Database
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/quickkart?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_minimum_32_characters_long
FRONTEND_URL=http://localhost:5173

# Account Security & Cryptographic OTP
OTP_HASH_SECRET=your_dedicated_otp_hmac_secret_key_random_string
OTP_TTL_MINUTES=5
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_ATTEMPTS=5

# Gmail SMTP Email Delivery
EMAIL_PROVIDER=smtp
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_google_app_password
EMAIL_FROM="QuickKart <your_email@gmail.com>"

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Image Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

> **Security Note**: Never commit `.env` files to git. Example templates are provided in `backend/.env.example`.

---

## 📧 How to Set Up Gmail SMTP (Google App Password)

QuickKart sends emails directly through Gmail SMTP without requiring third-party accounts, organization names, or credit cards.

1. Go to your [Google Account Security Settings](https://myaccount.google.com/security).
2. Enable **2-Step Verification** (if not already enabled).
3. Search for **"App Passwords"** in the top search bar (or visit [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
4. Enter an app name (e.g. `QuickKart`) and click **Create**.
5. Copy the generated **16-character password** (e.g. `abcd efgh ijkl mnop`).
6. Set in `backend/.env`:
   ```env
   EMAIL_USER=your_gmail_address@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   ```

---

## 🚀 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/E-Commerce.git
cd E-Commerce
```

### 2. Configure and run Backend
```bash
cd backend
npm install
# Create backend/.env using backend/.env.example
npm start
```
*Backend runs on `http://localhost:5000`*

### 3. Configure and run Frontend
```bash
cd ../frontend
npm install
# Create frontend/.env with VITE_API_URL=http://localhost:5000/api
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🧪 Automated Testing

The backend includes a comprehensive 22-test automated suite covering OTP challenges, expiration, replay attacks, authentication middleware, and email mock dispatch.

Run the test suite:
```bash
cd backend
npm test
```

Expected output:
```text
ℹ tests 22
ℹ suites 6
ℹ pass 22
ℹ fail 0
```

---

## 🌐 Production Deployment

### Why Vercel is Recommended for Both Frontend & Backend
* **Gmail SMTP Support**: Free hosting platforms like Render block outbound SMTP ports (465 and 587) on free plans. **Vercel allows Gmail SMTP**, delivering OTP emails in 1–2 seconds.
* **Zero Cold-Start Lag**: Eliminates Render's 50-second free-tier spin-down delay.
* **Unified Dashboard**: Manage frontend and serverless backend in one place.

### Deploying Backend to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) -> **Add New...** -> **Project**.
2. Import your `E-Commerce` repository.
3. In **Root Directory**, select `backend`.
4. Add all environment variables from `backend/.env` (`MONGO_URI`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, etc.).
5. Click **Deploy**. Your API URL will be: `https://your-backend.vercel.app/api`.

### Deploying Frontend to Vercel
1. In Vercel, click **Add New...** -> **Project**.
2. Import the same repository and set **Root Directory** to `frontend`.
3. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://your-backend.vercel.app/api`
   - `VITE_RAZORPAY_KEY_ID` = `your_razorpay_key_id`
4. Click **Deploy**.

---

## 🛡️ API Endpoints Summary

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user & issue 6-digit email OTP | Public |
| `POST` | `/api/auth/verify-email` | Verify registration OTP & activate account | Public |
| `POST` | `/api/auth/login` | Password login with unverified account guard | Public |
| `POST` | `/api/auth/otp-login/request` | Request passwordless 6-digit login OTP | Public |
| `POST` | `/api/auth/otp-login/verify` | Verify login OTP and issue JWT access token | Public |
| `POST` | `/api/auth/forgot-password` | Request password reset OTP | Public |
| `POST` | `/api/auth/verify-reset-otp` | Verify reset OTP & issue password-reset token | Public |
| `POST` | `/api/auth/reset-password` | Reset password using reset token | Public |
| `POST` | `/api/auth/resend-otp` | Resend verification OTP (enforces 60s cooldown) | Public |
| `GET` | `/api/auth/profile` | Get current user profile | Private |
| `PUT` | `/api/auth/profile` | Update profile information | Private |
| `POST` | `/api/auth/change-password` | Change password (requires current password) | Private |
| `GET` | `/api/products` | Get products with search, filter, and pagination | Public |
| `GET` | `/api/products/:id` | Get product details & reviews | Public |
| `POST` | `/api/products` | Create product (with Cloudinary image) | Admin |
| `GET` | `/api/cart` | Get user shopping cart | Private |
| `POST` | `/api/cart` | Add/update cart items | Private |
| `GET` | `/api/wishlist` | Get user wishlist | Private |
| `POST` | `/api/orders` | Create order & trigger confirmation email | Private |
| `GET` | `/api/orders/:id/invoice` | Download PDF tax invoice | Private |
| `GET` | `/api/admin/dashboard` | Get revenue stats & analytics trends | Admin |
| `GET` | `/api/admin/orders` | Get chronologically sorted customer orders | Admin |

---

## 📄 License

This project is licensed under the **ISC License**.
