# 🛍️ Talabat Angular — E-Commerce Frontend

A modern, responsive **Angular** storefront built for the Talabat E-Commerce platform, featuring JWT-secured API communication, a multi-step checkout wizard with **Stripe Elements**, and a real-time order tracking experience. The app integrates seamlessly with the .NET Core backend—buyer identity is handled entirely through bearer tokens, never passed as query parameters.

---

## ✨ Core Features

- 🔐 **JWT Authentication** — Login/register flows with token persistence and automatic attachment via HTTP interceptor
- 🛡️ **Route Guards** — `authGuard` protects basket, checkout, and orders routes
- 🛒 **Reactive Basket** — RxJS-powered basket state with live totals and Redis-backed persistence via the API
- 💳 **Multi-Step Checkout** — 4-step wizard: shipping address → delivery method → Stripe card payment → order confirmation
- 📦 **Order History** — User-scoped order list sorted newest-first, with detailed order views and status timeline
- 🎯 **Type-Safe Models** — TypeScript interfaces mirror backend DTOs (`IOrder`, `IOrderToCreate`, `IDeliveryMethod`, etc.)
- 🎨 **Polished UI** — Custom CSS with Bootstrap 5, Font Awesome icons, and SweetAlert2 notifications
- ⚡ **Lazy Loading** — Checkout, basket, orders, and account modules loaded on demand for faster initial load

---

## 🧰 Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Angular 20 (Standalone Components) |
| **Language** | TypeScript 5.9 |
| **State Management** | RxJS (`BehaviorSubject`, `ReplaySubject`, Observables) |
| **HTTP** | Angular HttpClient + JWT Interceptor |
| **Routing** | Angular Router with lazy-loaded routes & guards |
| **Payments** | Stripe.js (Elements — card payment) |
| **UI** | Bootstrap 5, Font Awesome 7, SweetAlert2 |
| **Build Tool** | Angular CLI / Vite |

![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=flat-square&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=flat-square&logo=reactivex)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat-square&logo=bootstrap)
![Stripe](https://img.shields.io/badge/Stripe-Elements-635BFF?style=flat-square&logo=stripe)

---

## 📂 Project Structure

```
src/
├── app/
│   ├── account/                  # Login & registration
│   │   ├── login/
│   │   ├── register/
│   │   ├── account.service.ts    # Auth API + currentUser$ stream
│   │   └── account.routes.ts
│   │
│   ├── basket/                   # Shopping basket page
│   │
│   ├── core/
│   │   ├── guards/
│   │   │   └── auth.guard.ts     # Protects authenticated routes
│   │   ├── interceptors/
│   │   │   └── jwt.interceptor.ts # Attaches Bearer token to all requests
│   │   └── services/
│   │       ├── basket.service.ts  # Basket CRUD + RxJS state
│   │       ├── order.service.ts   # Orders API (JWT-scoped, no email params)
│   │       └── payment.service.ts # PaymentIntent creation
│   │
│   ├── orders/
│   │   ├── checkout/             # 4-step checkout wizard + Stripe
│   │   ├── orders-list/          # Order history (newest first)
│   │   ├── order-details/        # Single order view + status timeline
│   │   └── orders.routes.ts
│   │
│   ├── product-list/             # Catalog with filtering
│   ├── product-details/          # Single product view
│   │
│   ├── shared/
│   │   └── models/               # TypeScript interfaces (order, basket, user)
│   │
│   ├── app.routes.ts             # Root routing configuration
│   └── app.config.ts             # Providers (HttpClient + JWT interceptor)
│
├── environments/
│   └── environment.ts            # API URL + Stripe publishable key
└── index.html                    # Stripe.js script tag
```

### Key Modules at a Glance

| Module | Purpose |
|---|---|
| **`core/services`** | Centralized API communication for basket, orders, and payments |
| **`core/interceptors`** | Automatically injects `Authorization: Bearer <token>` on every HTTP call |
| **`core/guards`** | Redirects unauthenticated users away from protected routes |
| **`shared/models`** | Strongly typed interfaces aligned with backend DTOs |
| **`orders/checkout`** | End-to-end purchase flow with Stripe card confirmation |
| **`orders/orders-list`** | Displays authenticated user's orders, sorted by date descending |

---

## 🗺️ Routes

| Path | Guard | Description |
|---|---|---|
| `/products` | — | Product catalog |
| `/products/:id` | — | Product details |
| `/basket` | ✅ | Shopping basket |
| `/checkout` | ✅ | Multi-step checkout wizard |
| `/orders` | ✅ | Order history list |
| `/orders/:id` | ✅ | Order details & status timeline |
| `/account/login` | — | User login |
| `/account/register` | — | User registration |

---

## 🔌 API Integration

The frontend communicates with the Talabat API at `https://localhost:7099/api/`. All authenticated requests rely on the JWT interceptor—**no email is ever sent as a query parameter**.

```typescript
// order.service.ts — buyer identity resolved server-side from JWT
getOrdersForUser(): Observable<IOrder[]> {
  return this.http.get<IOrder[]>(this.baseUrl + 'orders');
}

createOrder(order: IOrderToCreate): Observable<IOrder> {
  return this.http.post<IOrder>(this.baseUrl + 'orders', order);
}
```

### Checkout Flow

```
Step 1  →  Shipping address form
Step 2  →  Delivery method selection
Step 3  →  Stripe PaymentIntent created → card element mounted
Step 4  →  confirmCardPayment() → POST /api/orders → basket cleared → redirect to /orders
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- [Angular CLI](https://angular.dev/tools/cli) 20+
- Talabat API running at `https://localhost:7099`

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/talabat-angular.git
cd talabat-angular
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7099/api/',
  stripePublishableKey: 'pk_test_your_stripe_publishable_key'
};
```

> The Stripe publishable key must match the secret key configured in the backend `appsettings.json`.

### 4. Run the Development Server

```bash
ng serve
```

Open **http://localhost:4200** in your browser.

> The API must be running with CORS configured for `http://localhost:4200` (already set in the backend `Program.cs`).

### 5. Build for Production

```bash
ng build
```

Output is written to `dist/TalabatAngular/browser/`.

---

## 🔐 Authentication Flow

1. User logs in or registers via `/account/login` or `/account/register`
2. JWT token is stored in `localStorage`
3. `jwt.interceptor.ts` attaches the token to every outgoing HTTP request
4. `authGuard` checks for a valid token before allowing access to protected routes
5. Backend resolves buyer email from JWT claims for orders and payments

---

## 📦 Order Status Display

The frontend maps backend `OrderStatus` enum values to user-friendly labels:

| Status Value | Label | UI State |
|---|---|---|
| `0` | Pending | ⏳ Yellow badge |
| `1` | Payment Received | ✅ Green badge |
| `2` | Payment Failed | ❌ Red badge |

Order details include a visual timeline: **Order Placed → Processing → Completed**.

---

## 📄 License

This project is part of the **Talabat E-Commerce** portfolio. All rights reserved.
