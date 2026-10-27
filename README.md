# Talabat 

Full-stack e-commerce platform: **ASP.NET Core** backend (API + Admin) and **Angular** storefront, with bilingual **English / Arabic** UI.

**[English](#english)** · **[العربية](#العربية)**

More detail in the nested docs:

- Backend API: [`Talabat.Solution.API/README.md`](Talabat.Solution.API/README.md)
- Angular storefront: [`AngularTalabat/TalabatAngular/README.md`](AngularTalabat/TalabatAngular/README.md)
- Shared i18n strings: [`Shared/Resources/README.md`](Shared/Resources/README.md)

---

## English

### Overview

Talabat 2026 is a food / retail style store with:

- Public catalog (products, brands, categories, offers, bestsellers)
- Redis-backed shopping basket
- JWT auth, profile, and order history
- Stripe card checkout (PaymentIntent + webhook)
- Admin MVC dashboard (inventory ledger, orders, finance, users)
- Shared AR/EN resource files for the store and the admin panel

### Tech stack

| Area | Technology |
|------|------------|
| Backend runtime | .NET 9 |
| API | ASP.NET Core Web API + JWT Bearer |
| Admin | ASP.NET Core MVC + cookie auth (`Admin` role) |
| ORM / DB | EF Core 9 · SQL Server |
| Cache / basket | Redis (StackExchange.Redis) |
| Payments | Stripe.net · Stripe.js Elements |
| Identity | ASP.NET Core Identity |
| Frontend | Angular 20 (standalone) · TypeScript 5.9 · RxJS 7.8 |
| UI | Bootstrap 5 · SweetAlert2 · Font Awesome |
| i18n | Shared JSON (`Shared/Resources`) |

### Repository structure

```
Talabat2026/
├── Talabat.Solution.API/          # .NET solution
│   ├── Talabat.API/               # Public Web API
│   ├── Talabat.Admin/             # Admin MVC panel
│   ├── Talabat.Core/              # Entities, contracts, specs
│   ├── Talabat.Services/          # Business logic
│   └── Talabat.Repository/        # EF contexts, migrations, UoW
├── AngularTalabat/
│   └── TalabatAngular/            # Storefront
└── Shared/
    └── Resources/                 # en.json + ar.json (single source of truth)
```

Solution file: `Talabat.Solution.API/Talabat.Solution.API.sln`

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [SQL Server](https://www.microsoft.com/sql-server) (LocalDB or full instance)
- [Redis](https://redis.io/) running locally
- [Node.js](https://nodejs.org/) 18+ and npm
- [Angular CLI](https://angular.dev/tools/cli) 20+ (optional if you use `npx ng`)
- Stripe account (test mode) and optionally [Stripe CLI](https://stripe.com/docs/stripe-cli)
- SMTP credentials if you want order / forgot-password emails

### Default local ports

| App | HTTPS | HTTP |
|-----|-------|------|
| API | `https://localhost:7099` | `http://localhost:5121` |
| Admin | `https://localhost:7100` | `http://localhost:5100` |
| Angular | — | `http://localhost:4200` |

CORS on the API already allows `http://localhost:4200`.

### Configuration (keys only — do not commit real secrets)

**API** — `Talabat.Solution.API/Talabat.API/appsettings.json` (prefer [User Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) in real use):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TalabatDatabase;Trusted_Connection=True;TrustServerCertificate=True;",
    "IdentityConnection": "Server=localhost;Database=TalabatDatabaseIdentity;Trusted_Connection=True;TrustServerCertificate=True;",
    "Redis": "localhost"
  },
  "JWT": {
    "key": "<at-least-32-char-secret>",
    "validIssure": "https://localhost:7099",
    "validAudience": "MySecretApiUser",
    "DurationInDays": 30
  },
  "ApiBaseUrl": "https://localhost:7099",
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "FromEmail": "<your-email>",
    "FromName": "Talabat Store",
    "AppPassword": "<smtp-app-password>"
  },
  "StripeSettings": {
    "PublishableKey": "pk_test_...",
    "SecretKey": "sk_test_...",
    "WebhookSecret": "whsec_..."
  }
}
```

**Admin** — `Talabat.Solution.API/Talabat.Admin/appsettings.json`: same connection / JWT / Stripe / `ApiBaseUrl` ideas, plus product images path where configured.

**Angular** — `AngularTalabat/TalabatAngular/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7099/api/',
  stripePublishableKey: 'pk_test_...'
};
```

> Never commit live passwords, JWT keys, or Stripe secret / webhook secrets.

### Run — Backend API

```bash
cd Talabat.Solution.API/Talabat.API
dotnet ef database update --project ../Talabat.Repository
dotnet run --launch-profile https
```

- Swagger / API base: `https://localhost:7099`
- REST base path: `https://localhost:7099/api`

### Run — Admin panel

```bash
cd Talabat.Solution.API/Talabat.Admin
dotnet run --launch-profile https
```

Open `https://localhost:7100`. Sign in with an Identity user that has the **Admin** role.

Language toggle (EN / AR) uses a culture cookie; UI strings load from `wwwroot/resources/{en|ar}.json`.

### Run — Angular storefront

```bash
cd AngularTalabat/TalabatAngular
npm install
ng serve
```

Open `http://localhost:4200`.

Production build:

```bash
ng build
```

Output: `dist/TalabatAngular/browser/`.

### Stripe webhook (local)

```bash
stripe listen --forward-to https://localhost:7099/api/payments/webhook
```

Put the printed `whsec_...` into `StripeSettings:WebhookSecret`.

### API endpoints (overview)

Base: `https://localhost:7099/api`

| Area | Examples |
|------|----------|
| Account | `POST /account/login`, `POST /account/register`, profile GET/PUT, change password, forgot password |
| Products | `GET /product`, `GET /product/{id}`, brands, categories, offers, bestsellers |
| Basket | `GET/POST/DELETE /basket` (Redis) |
| Orders | `POST/GET /orders`, `GET /orders/{id}`, `GET /orders/deliveryMethod` (buyer from JWT) |
| Payments | `POST /payments/{basketId}`, `POST /payments/webhook` |

Buyer email for orders/payments is taken from the JWT — not from query strings.

### Admin modules

Dashboard · Products · Brands · Categories · Offers · Inventory (stock ledger) · Orders · Finance · Users · Language switch.

### Angular routes

| Path | Auth | Description |
|------|------|-------------|
| `/products`, `/products/:id` | No | Catalog & details |
| `/basket`, `/checkout` | Yes | Basket & 4-step checkout |
| `/orders`, `/orders/:id` | Yes | History & timeline |
| `/account/login`, `/register`, `/forgot-password`, `/profile` | Mixed | Auth & profile |

### Bilingual UI (AR / EN)

Single source of truth: `Shared/Resources/en.json` and `ar.json`.

Sync into both apps after edits:

```bash
cp Shared/Resources/*.json Talabat.Solution.API/Talabat.Admin/wwwroot/resources/
cp Shared/Resources/*.json AngularTalabat/TalabatAngular/public/i18n/
```

- Angular: `{{ 'nav.shop' | t }}` / `I18nService`
- Admin Razor: `@L["admin.nav.dashboard"]`

Catalog fields also support bilingual product/brand/category names (`Name` / `NameAr`, etc.).

### Payment & order flow

```
Login (JWT) → Basket (Redis) → Checkout address/delivery
→ POST /payments/{basketId} (PaymentIntent)
→ Stripe confirm card → POST /orders
→ Webhook updates status by PaymentIntentId
```

### Architecture notes

Clean-ish layered backend: API/Admin hosts → Services → Repository → SQL Server / Redis. Specification pattern for product/order queries; Unit of Work for commits. Angular uses standalone components, JWT interceptor, and route guards.

### License

Part of the Talabat e-commerce portfolio. All rights reserved.

---

## العربية

### نظرة عامة

**طلباتي 2026** منصة تجارة إلكترونية متكاملة تشمل:

- كتالوج عام (منتجات، علامات، تصنيفات، عروض، الأكثر مبيعًا)
- سلة محفوظة على Redis
- مصادقة JWT، ملف شخصي، وسجل طلبات
- دفع ببطاقة عبر Stripe (PaymentIntent + Webhook)
- لوحة أدمن MVC (جرد المخزون، الطلبات، المالية، المستخدمون)
- واجهة ثنائية اللغة عربي / إنجليزي للمتجر ولوحة التحكم

### التقنيات

| الجزء | التقنية |
|------|---------|
| الباكند | .NET 9 |
| الـ API | ASP.NET Core Web API + JWT |
| الأدمن | ASP.NET Core MVC + كوكي (`Admin`) |
| قاعدة البيانات | EF Core 9 · SQL Server |
| الكاش / السلة | Redis |
| الدفع | Stripe.net · Stripe Elements |
| الهوية | ASP.NET Core Identity |
| الفرونت | Angular 20 · TypeScript 5.9 · RxJS |
| الواجهة | Bootstrap 5 · SweetAlert2 |
| الترجمة | ملفات JSON مشتركة في `Shared/Resources` |

### هيكل المستودع

```
Talabat2026/
├── Talabat.Solution.API/          # حل .NET
│   ├── Talabat.API/               # الـ API العام
│   ├── Talabat.Admin/             # لوحة الأدمن
│   ├── Talabat.Core/
│   ├── Talabat.Services/
│   └── Talabat.Repository/
├── AngularTalabat/
│   └── TalabatAngular/            # واجهة المتجر
└── Shared/
    └── Resources/                 # en.json + ar.json
```

ملف الحل: `Talabat.Solution.API/Talabat.Solution.API.sln`

### المتطلبات

- SDK لـ .NET 9
- SQL Server
- Redis محلي
- Node.js 18+ و npm
- Angular CLI 20+ (اختياري مع `npx ng`)
- حساب Stripe (وضع تجريبي) ويفضّل Stripe CLI
- إعدادات SMTP إن أردت رسائل البريد (طلب / نسيت كلمة المرور)

### المنافذ الافتراضية محليًا

| التطبيق | HTTPS | HTTP |
|---------|-------|------|
| API | `https://localhost:7099` | `http://localhost:5121` |
| الأدمن | `https://localhost:7100` | `http://localhost:5100` |
| Angular | — | `http://localhost:4200` |

الـ CORS في الـ API يسمح بـ `http://localhost:4200`.

### الإعداد (مفاتيح فقط — لا ترفع أسرارًا حقيقية)

**الـ API** — `Talabat.Solution.API/Talabat.API/appsettings.json` (يفضّل User Secrets):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TalabatDatabase;Trusted_Connection=True;TrustServerCertificate=True;",
    "IdentityConnection": "Server=localhost;Database=TalabatDatabaseIdentity;Trusted_Connection=True;TrustServerCertificate=True;",
    "Redis": "localhost"
  },
  "JWT": {
    "key": "<مفتاح-سري-32-حرف-على-الأقل>",
    "validIssure": "https://localhost:7099",
    "validAudience": "MySecretApiUser",
    "DurationInDays": 30
  },
  "ApiBaseUrl": "https://localhost:7099",
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "FromEmail": "<بريدك>",
    "FromName": "Talabat Store",
    "AppPassword": "<كلمة-مرور-التطبيق>"
  },
  "StripeSettings": {
    "PublishableKey": "pk_test_...",
    "SecretKey": "sk_test_...",
    "WebhookSecret": "whsec_..."
  }
}
```

**الأدمن** — نفس فكرة سلاسل الاتصال و JWT و Stripe و `ApiBaseUrl` في `Talabat.Admin/appsettings.json`.

**Angular** — `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7099/api/',
  stripePublishableKey: 'pk_test_...'
};
```

> لا ترفع كلمات المرور أو مفاتيح JWT أو أسرار Stripe إلى Git.

### التشغيل — الـ API

```bash
cd Talabat.Solution.API/Talabat.API
dotnet ef database update --project ../Talabat.Repository
dotnet run --launch-profile https
```

- العنوان: `https://localhost:7099`
- مسار الـ REST: `https://localhost:7099/api`

### التشغيل — لوحة الأدمن

```bash
cd Talabat.Solution.API/Talabat.Admin
dotnet run --launch-profile https
```

افتح `https://localhost:7100` وسجّل دخول بمستخدم لديه دور **Admin**.

تبديل اللغة (عربي / إنجليزي) عبر كوكي الثقافة؛ النصوص من `wwwroot/resources/{en|ar}.json`.

### التشغيل — متجر Angular

```bash
cd AngularTalabat/TalabatAngular
npm install
ng serve
```

افتح `http://localhost:4200`.

بناء للإنتاج:

```bash
ng build
```

المخرجات في `dist/TalabatAngular/browser/`.

### Webhook لـ Stripe محليًا

```bash
stripe listen --forward-to https://localhost:7099/api/payments/webhook
```

ضع `whsec_...` في `StripeSettings:WebhookSecret`.

### نظرة على نقاط الـ API

الأساس: `https://localhost:7099/api`

| القسم | أمثلة |
|------|--------|
| الحساب | تسجيل دخول / تسجيل / الملف / نسيت كلمة المرور |
| المنتجات | قائمة، تفاصيل، علامات، تصنيفات، عروض، الأكثر مبيعًا |
| السلة | جلب / حفظ / حذف (Redis) |
| الطلبات | إنشاء وجلب (البريد من JWT) وطرق التوصيل |
| الدفع | PaymentIntent + Webhook |

بريد المشتري للطلبات والدفع يُستخرج من الـ JWT وليس من الـ query string.

### أقسام الأدمن

لوحة التحكم · المنتجات · العلامات · التصنيفات · العروض · الجرد · الطلبات · المالية · المستخدمون · تبديل اللغة.

### مسارات Angular

| المسار | حماية | الوصف |
|--------|-------|--------|
| `/products`, `/products/:id` | لا | الكتالوج والتفاصيل |
| `/basket`, `/checkout` | نعم | السلة وإتمام الشراء (4 خطوات) |
| `/orders`, `/orders/:id` | نعم | الطلبات والجدول الزمني |
| `/account/*` | حسب الصفحة | دخول، تسجيل، نسيت كلمة المرور، الملف |

### الواجهة ثنائية اللغة

المصدر الواحد: `Shared/Resources/en.json` و `ar.json`.

بعد التعديل انسخ للمشروعين:

```bash
cp Shared/Resources/*.json Talabat.Solution.API/Talabat.Admin/wwwroot/resources/
cp Shared/Resources/*.json AngularTalabat/TalabatAngular/public/i18n/
```

- Angular: `{{ 'nav.shop' | t }}`
- الأدمن: `@L["admin.nav.dashboard"]`

أسماء المنتجات والعلامات والتصنيفات تدعم حقول عربي/إنجليزي (`Name` / `NameAr` إلخ).

### تدفق الدفع والطلب

```
تسجيل الدخول (JWT) → السلة (Redis) → عنوان وطريقة التوصيل
→ إنشاء PaymentIntent → تأكيد البطاقة في Stripe
→ إنشاء الطلب → الـ Webhook يحدّث الحالة عبر PaymentIntentId
```

### ملاحظات معمارية

طبقات: المضيفات (API/Admin) ← الخدمات ← المستودع ← SQL Server / Redis. نمط المواصفات (Specification) للاستعلامات، و Unit of Work للحفظ. Angular بمكونات standalone، interceptor للـ JWT، وـ guards للمسارات المحمية.

### الترخيص

جزء من محفظة مشروع طلباتي للتجارة الإلكترونية. جميع الحقوق محفوظة.
