# Daggy's Cafe — Healthy Meal Delivery App

A Next.js demo storefront for a macro-counted meal delivery service. Pakistani Rupee pricing, Stripe-powered checkout (test mode), an admin dashboard, and a 3D food-card variant.

## Features

- **Menu categories**: Burgers, Healthy Bowls, Desserts, Sides
- **Macro tracking**: calories, protein, carbs, fats per item
- **Shopping cart**: localStorage-backed, quantity controls, full sheet UI
- **Checkout**: Stripe Elements (Payment Intent flow) with a hosted Payment Link fallback when API keys are missing
- **Admin dashboard**: order management, sales chart, payment-management panel
- **Responsive UI**: Tailwind + shadcn/ui, mobile-first
- **3D food cards**: optional `react-three-fiber` card view with a graceful 2D fallback when WebGL is unavailable

## Menu (PKR)

### Burgers
- Classic Beef Burger — Rs 3,637
- Grilled Chicken Burger — Rs 3,357
- BBQ Bacon Burger — Rs 3,917
- Veggie Deluxe Burger — Rs 3,077

### Healthy Bowls
- Quinoa & Kale Bowl — Rs 4,060
- Salmon & Avocado Bowl — Rs 4,757
- Buddha Bowl — Rs 4,060

### Desserts
- Protein Brownie — Rs 1,677
- Greek Yogurt Parfait — Rs 1,820
- Mango Mousse Cake — Rs 4,060

### Sides
- Sweet Potato Fries — Rs 1,397
- Side Salad — Rs 1,117

Prices live in [src/lib/data.ts](src/lib/data.ts). Formatting is centralized in `formatPrice()` at [src/lib/utils.ts](src/lib/utils.ts).

## Tech stack

- **Framework**: Next.js 15 (App Router) + Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: shadcn/ui + Radix primitives, Lucide icons
- **3D**: `@react-three/fiber`, `@react-three/drei`
- **Payments**: Stripe (Payment Intents + Payment Links)
- **Backend**: Supabase (payment intent + order persistence — optional)
- **Realtime**: socket.io for admin order push
- **AI helpers**: Genkit (Google AI)

## Getting started

### Prerequisites

- **Node.js 18, 20, or 22.** If you're on Node 25+, the `dev`/`build`/`start` scripts already pass `--no-experimental-webstorage` to work around a known broken-`localStorage` global that crashes SSR — no extra setup needed.
- npm

### Install

```bash
git clone <repository-url>
cd daggys-cafe
npm install
```

### Environment variables

Copy the example and fill in your own Stripe test keys:

```bash
cp .env.local.example .env.local
```

Required for live Stripe checkout (without these, the `/checkout` page falls back to a Payment Link button):

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys) |
| `STRIPE_SECRET_KEY` | same page |

Optional:

| Variable | Why |
|---|---|
| `STRIPE_WEBHOOK_SECRET` | only needed when wiring `/api/payments/webhook`. Get with `stripe listen --forward-to localhost:9002/api/payments/webhook` |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | overrides for the public-fallback Supabase project hard-coded in [src/lib/supabase.ts](src/lib/supabase.ts) |

### Run

```bash
npm run dev
```

Visit [http://localhost:9002](http://localhost:9002).

### Testing the checkout

Use Stripe's test card — **never enter real card details**:

```
Card:   4242 4242 4242 4242
Expiry: any future MM/YY  (e.g. 05/34)
CVC:    any 3 digits      (e.g. 540)
ZIP:    any 5 digits      (e.g. 54000)
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server with Turbopack on port 9002 |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run genkit:dev` | Start Genkit AI dev server |
| `npm run genkit:watch` | Genkit with file-watch mode |

## Project structure

```
src/
├── app/                              # Next.js App Router
│   ├── admin/                        # Admin dashboard + client widgets
│   ├── api/
│   │   └── payments/
│   │       ├── create-intent/        # Stripe Payment Intent endpoint (PKR)
│   │       └── webhook/              # Stripe webhook (signature-verified)
│   ├── checkout/                     # Stripe Elements form + Payment Link fallback
│   ├── confirmation/                 # Post-payment landing
│   ├── demo-3d/                      # 3D food-card showcase
│   ├── layout.tsx
│   └── page.tsx                      # Home: meal grid by category
├── components/
│   ├── ui/                           # shadcn/ui primitives
│   ├── food-card-3d/                 # 3D card + 2D fallback + WebGL detection
│   ├── add-to-cart-button.tsx
│   ├── cart-icon.tsx
│   ├── cart-sheet.tsx
│   ├── header.tsx
│   ├── meal-image.tsx                # Local-first image with Unsplash onError fallback
│   └── payment-management.tsx        # Admin payments panel (Supabase-backed)
├── hooks/
│   ├── use-cart.tsx
│   ├── use-socket.tsx                # socket.io client for admin order push
│   └── use-toast.ts
├── lib/
│   ├── data.ts                       # Menu + sample orders (PKR amounts)
│   ├── stripe.ts                     # Stripe SDK init + amount helpers
│   ├── supabase.ts                   # Supabase client (with public fallback)
│   ├── utils.ts                      # cn() + formatPrice()
│   └── webgl-detection.ts            # 3D card capability + motion preference
└── ai/
    ├── dev.ts
    └── genkit.ts

public/
├── favicon.ico                       # served from /public (not app/) — see Notes
└── images/
    └── meals/                        # Drop JPGs here to override Unsplash defaults
```

## Images

Each meal in [`src/lib/data.ts`](src/lib/data.ts) has two image sources:

- `image` — Unsplash URL (always-available remote fallback)
- `localImage` — path under `public/images/meals/` (preferred when present)

The [`MealImage`](src/components/meal-image.tsx) client component starts with `localImage` and falls back to `image` via `onError` if the local file is missing. To use your own photos, drop them into `public/images/meals/` matching the slugs in `localImage` (filename list is in [`public/images/meals/README.md`](public/images/meals/README.md)).

## Deploying

This project deploys to Vercel out of the box. **Env vars must be added in the Vercel dashboard** (`Settings → Environment Variables`); `.env.local` is gitignored and not uploaded. After saving env vars, trigger a fresh deploy — env-var changes don't take effect on already-built deployments.

## License

MIT.
