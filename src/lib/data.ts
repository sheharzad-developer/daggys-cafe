export interface Meal {
  id: number;
  name: string;
  category: 'Burgers' | 'Desserts' | 'Healthy Bowls' | 'Sides';
  price: number;
  image: string;
  localImage?: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  dataAiHint: string;
}

// Unsplash photo URLs are kept as the always-available `image` (remote fallback).
// Drop matching files into /public/images/meals/<slug>.jpg to override with local assets.
const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

export const meals: Meal[] = [
  {
    id: 1,
    name: 'Classic Beef Burger',
    category: 'Burgers',
    price: 3637,
    image: unsplash('photo-1568901346375-23c9450c58cd'),
    localImage: '/images/meals/classic-beef-burger.jpg',
    macros: { calories: 650, protein: 40, carbs: 45, fats: 30 },
    dataAiHint: 'beef burger',
  },
  {
    id: 2,
    name: 'Grilled Chicken Burger',
    category: 'Burgers',
    price: 3357,
    image: unsplash('photo-1606755962773-d324e0a13086'),
    localImage: '/images/meals/grilled-chicken-burger.jpg',
    macros: { calories: 550, protein: 45, carbs: 42, fats: 20 },
    dataAiHint: 'chicken burger',
  },
  {
    id: 3,
    name: 'Quinoa & Kale Bowl',
    category: 'Healthy Bowls',
    price: 4060,
    image: unsplash('photo-1512621776951-a57141f2eefd'),
    localImage: '/images/meals/quinoa-kale-bowl.jpg',
    macros: { calories: 480, protein: 20, carbs: 60, fats: 18 },
    dataAiHint: 'quinoa salad',
  },
  {
    id: 4,
    name: 'Salmon & Avocado Bowl',
    category: 'Healthy Bowls',
    price: 4757,
    image: unsplash('photo-1546069901-ba9599a7e63c'),
    localImage: '/images/meals/salmon-avocado-bowl.jpg',
    macros: { calories: 590, protein: 35, carbs: 40, fats: 32 },
    dataAiHint: 'salmon bowl',
  },
  {
    id: 5,
    name: 'Protein Brownie',
    category: 'Desserts',
    price: 1677,
    image: unsplash('photo-1606313564200-e75d5e30476c'),
    localImage: '/images/meals/protein-brownie.jpg',
    macros: { calories: 250, protein: 20, carbs: 25, fats: 12 },
    dataAiHint: 'chocolate brownie',
  },
  {
    id: 6,
    name: 'Greek Yogurt Parfait',
    category: 'Desserts',
    price: 1820,
    image: unsplash('photo-1488477181946-6428a0291777'),
    localImage: '/images/meals/greek-yogurt-parfait.jpg',
    macros: { calories: 300, protein: 25, carbs: 35, fats: 8 },
    dataAiHint: 'yogurt parfait',
  },
  {
    id: 7,
    name: 'Sweet Potato Fries',
    category: 'Sides',
    price: 1397,
    image: unsplash('photo-1573080496219-bb080dd4f877'),
    localImage: '/images/meals/sweet-potato-fries.jpg',
    macros: { calories: 350, protein: 5, carbs: 55, fats: 13 },
    dataAiHint: 'sweet potato',
  },
  {
    id: 8,
    name: 'Side Salad',
    category: 'Sides',
    price: 1117,
    image: unsplash('photo-1505253716362-afaea1d3d1af'),
    localImage: '/images/meals/side-salad.jpg',
    macros: { calories: 150, protein: 3, carbs: 10, fats: 10 },
    dataAiHint: 'green salad',
  },
  {
    id: 9,
    name: 'BBQ Bacon Burger',
    category: 'Burgers',
    price: 3917,
    image: unsplash('photo-1553979459-d2229ba7433b'),
    localImage: '/images/meals/bbq-bacon-burger.jpg',
    macros: { calories: 720, protein: 42, carbs: 48, fats: 35 },
    dataAiHint: 'bbq burger',
  },
  {
    id: 10,
    name: 'Veggie Deluxe Burger',
    category: 'Burgers',
    price: 3077,
    image: unsplash('photo-1520072959219-c595dc870360'),
    localImage: '/images/meals/veggie-deluxe-burger.jpg',
    macros: { calories: 480, protein: 25, carbs: 52, fats: 18 },
    dataAiHint: 'veggie burger',
  },
  {
    id: 11,
    name: 'Buddha Bowl',
    category: 'Healthy Bowls',
    price: 4060,
    image: unsplash('photo-1543352634-99a5d50ae78e'),
    localImage: '/images/meals/buddha-bowl.jpg',
    macros: { calories: 480, protein: 20, carbs: 60, fats: 18 },
    dataAiHint: 'buddha bowl',
  },
  {
    id: 12,
    name: 'Mango Mousse Cake',
    category: 'Desserts',
    price: 4060,
    image: unsplash('photo-1565958011703-44f9829ba187'),
    localImage: '/images/meals/mango-mousse-cake.jpg',
    macros: { calories: 480, protein: 20, carbs: 60, fats: 18 },
    dataAiHint: 'mango cake',
  },
];

export interface Order {
    id: string;
    customerName: string;
    total: number;
    status: 'Pending' | 'Delivered' | 'Cancelled';
    date: Date;
    items: {
        mealName: string;
        quantity: number;
        price: number;
    }[];
}

export const orders: Order[] = [
    {
        id: 'ORD001',
        customerName: 'John Doe',
        total: 6994,
        status: 'Delivered',
        date: new Date('2024-07-20T10:30:00'),
        items: [{ mealName: 'Classic Beef Burger', quantity: 2, price: 3637 }],
    },
    {
        id: 'ORD002',
        customerName: 'Jane Smith',
        total: 8817,
        status: 'Pending',
        date: new Date('2024-07-21T11:00:00'),
        items: [
            { mealName: 'Salmon & Avocado Bowl', quantity: 1, price: 4757 },
            { mealName: 'Protein Brownie', quantity: 1, price: 1677 },
            { mealName: 'Side Salad', quantity: 1, price: 1117 },
        ],
    },
    {
        id: 'ORD003',
        customerName: 'Mike Johnson',
        total: 4060,
        status: 'Pending',
        date: new Date('2024-07-21T12:15:00'),
        items: [{ mealName: 'Quinoa & Kale Bowl', quantity: 1, price: 4060 }],
    },
     {
        id: 'ORD004',
        customerName: 'Emily Davis',
        total: 11892,
        status: 'Delivered',
        date: new Date('2024-07-20T14:00:00'),
        items: [
            { mealName: 'Grilled Chicken Burger', quantity: 2, price: 3357 },
            { mealName: 'Sweet Potato Fries', quantity: 2, price: 1397 },
        ],
    },
     {
        id: 'ORD005',
        customerName: 'Chris Brown',
        total: 5180,
        status: 'Cancelled',
        date: new Date('2024-07-19T09:00:00'),
        items: [
            { mealName: 'Greek Yogurt Parfait', quantity: 2, price: 1820 },
            { mealName: 'Protein Brownie', quantity: 1, price: 1677 },
        ],
    }
];
