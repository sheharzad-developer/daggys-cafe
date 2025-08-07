# Daggy's Cafe - Healthy Meal Delivery App

A modern Next.js application for a healthy meal delivery service featuring macro-counted meals with a beautiful, responsive UI.

## Features

- 🍔 **Menu Categories**: Burgers, Healthy Bowls, Desserts, and Sides
- 📊 **Macro Tracking**: Detailed nutritional information (calories, protein, carbs, fats)
- 🛒 **Shopping Cart**: Add items to cart with quantity management
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- ⚡ **Fast Performance**: Built with Next.js 15 and Turbopack
- 🎨 **Modern UI**: Shadcn/ui components with beautiful animations

## Menu Items

### Burgers
- Classic Beef Burger - $12.99
- Grilled Chicken Burger - $11.99
- BBQ Bacon Burger - $13.99
- Veggie Deluxe Burger - $10.99

### Healthy Bowls
- Quinoa & Kale Bowl - $14.50
- Salmon & Avocado Bowl - $16.99

### Desserts
- Protein Brownie - $5.99
- Greek Yogurt Parfait - $6.50

### Sides
- Sweet Potato Fries - $4.99
- Side Salad - $3.99

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui + Radix UI
- **Icons**: Lucide React
- **TypeScript**: Full type safety
- **Build Tool**: Turbopack for fast development

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd download
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:9002](http://localhost:9002) in your browser

## Available Scripts

- `npm run dev` - Start development server with Turbopack on port 9002
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run genkit:dev` - Start Genkit development server
- `npm run genkit:watch` - Start Genkit with watch mode

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── admin/          # Admin dashboard
│   ├── checkout/       # Checkout process
│   ├── confirmation/   # Order confirmation
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # Reusable UI components
│   ├── ui/            # Shadcn/ui components
│   ├── add-to-cart-button.tsx
│   ├── cart-sheet.tsx
│   └── header.tsx
├── hooks/             # Custom React hooks
│   ├── use-cart.tsx
│   └── use-toast.ts
├── lib/               # Utility functions and data
│   ├── data.ts        # Menu items and orders data
│   └── utils.ts       # Helper functions
└── ai/                # AI integration (Genkit)
    ├── dev.ts
    └── genkit.ts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
