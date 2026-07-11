# QuickKart 🛒

**QuickKart** is a full-stack MERN e-commerce platform with Razorpay payments, admin panel, order tracking, PDF invoices, and email notifications.

Live-style demo app built with React, Node.js, Express, and MongoDB.

---

## Features

### Customer
- User registration, login, forgot/reset password
- Browse products with search, category filters, and sorting
- Product details with reviews and ratings
- Cart and wishlist
- Secure checkout with **Razorpay**
- Order history with status tracking
- Download invoice PDF from My Orders
- Order confirmation & status update emails
- Dark mode
- Mobile-friendly UI with bottom navigation

### Admin
- Dashboard with stats and charts
- Add, edit, and delete products (with Cloudinary image upload)
- Manage all orders and update delivery status
- Revenue and order analytics

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, Vite, Redux Toolkit, React Router, Tailwind CSS, Axios, React Hot Toast, Recharts |
| **Backend** | Node.js, Express.js, JWT, bcrypt |
| **Database** | MongoDB (Mongoose) |
| **Payments** | Razorpay |
| **Email** | Nodemailer (Gmail) |
| **File Storage** | Cloudinary |
| **PDF** | PDFKit |

---

## Project Structure

```
E-Commerce/
├── backend/          # Express API
│   ├── config/       # DB, email, Cloudinary
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/         # React + Vite app
│   ├── public/
│   └── src/
└── README.md
```

---

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Razorpay account (test keys for development)
- Cloudinary account (product images)
- Gmail account with App Password (for emails)

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/E-Commerce.git
cd E-Commerce
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret

EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:5173

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PORT=5000
```

Start the backend:

```bash
node server.js
```

API runs at `http://localhost:5000`

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Start the frontend:

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT tokens |
| `EMAIL_USER` | Gmail address for sending emails |
| `EMAIL_PASS` | Gmail app password |
| `FRONTEND_URL` | Frontend URL (for password reset links) |
| `RAZORPAY_KEY_ID` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `PORT` | Server port (default: 5000) |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (must end with `/api`) |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key ID |

> **Never commit `.env` files to GitHub.** They are listed in `.gitignore`.

---

## Deployment

### GitHub
Push the full project (frontend + backend). Do **not** upload:
- `node_modules/`
- `.env` files
- `frontend/dist/`

### Render (Backend)
| Setting | Value |
|---------|--------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `node server.js` |

Add all backend environment variables in the Render dashboard. Set `FRONTEND_URL` to your Vercel URL.

### Vercel (Frontend)
| Setting | Value |
|---------|--------|
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Environment variables:
- `VITE_API_URL` → `https://your-backend.onrender.com/api`
- `VITE_RAZORPAY_KEY_ID` → your Razorpay key ID

SPA routing is configured via `frontend/vercel.json`.

---

## Razorpay Test Mode

Use Razorpay **test keys** during development. For test card payments:
- Use Indian test card numbers from the [Razorpay docs](https://razorpay.com/docs/payments/payments/test-card-details/)
- International cards may fail with "International cards are not supported" in test mode — this is expected

---

## Admin Access

Register a normal user, then set `isAdmin: true` for that user in MongoDB, or use the admin scripts in `backend/scripts/`.

---

## API Overview

| Route | Description |
|-------|-------------|
| `/api/auth` | Register, login, profile, password reset |
| `/api/products` | Products and reviews |
| `/api/cart` | Shopping cart |
| `/api/wishlist` | Wishlist |
| `/api/orders` | Orders and invoices |
| `/api/payment` | Razorpay create-order and verify |
| `/api/upload` | Image upload (admin) |
| `/api/admin` | Dashboard stats |

---

## Author

Built as a MERN e-commerce portfolio project.

---

## License

ISC
