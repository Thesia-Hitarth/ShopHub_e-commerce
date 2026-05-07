# ShopHub E-Commerce

ShopHub is a full-stack e-commerce prototype built with a Next.js frontend and an Express + TypeScript backend. It demonstrates product browsing, search, user authentication, cart/wishlist flows, checkout support, admin product management, and analytics.

## Tech Stack

- Frontend: **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS**, **Recharts**
- Backend: **Node.js**, **Express 5**, **TypeScript**, **CORS**, **dotenv**

## Features

- Home page with featured products, collections, and categories
- Product detail views with image galleries and reviews
- Search and category filtering
- Authentication with register/login and profile pages
- Cart, wishlist, and checkout flows
- Coupon validation and order creation
- Admin dashboard for product management, order listing, and analytics
- Responsive UI with dark/light theme support

## Repository Structure

- `Backend/` — Express API server, TypeScript source, and build scripts
- `Frontend/` — Next.js app with pages, client components, and storefront UI

## Prerequisites

- Node.js 20+ recommended
- npm or yarn

## Setup

### Backend

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/` if you want a custom secret or port:

```env
PORT=3001
JWT_SECRET=shophub-dev-secret
```

Run the backend in development mode:

```bash
npm run dev
```

Build and start production backend:

```bash
npm run build
npm start
```

### Frontend

```bash
cd Frontend
npm install
```

Run the frontend in development mode:

```bash
npm run dev
```

Build and run production frontend:

```bash
npm run build
npm start
```

## Default Ports

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

> The frontend expects the backend API to be available on port `3001`.

## Backend API Endpoints

### Public routes

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/:id/reviews`
- `POST /api/products/:id/reviews` (requires auth)
- `GET /api/categories`
- `GET /api/categories/:slug`
- `POST /api/coupons/validate`
- `GET /api/orders` (requires auth)
- `POST /api/orders` (requires auth)

### Admin routes

- `GET /api/admin/products` (requires admin)
- `POST /api/admin/products` (requires admin)
- `PUT /api/admin/products/:id` (requires admin)
- `DELETE /api/admin/products/:id` (requires admin)
- `GET /api/admin/orders` (requires admin)
- `GET /api/admin/analytics` (requires admin)

## Notes

- This project uses in-memory data stores for products, users, orders, and coupons.
- For production, replace in-memory state with a persistent database.
- The UI includes client components for cart, wishlist, theme switching, and protected routes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

Happy building with ShopHub! 🚀
