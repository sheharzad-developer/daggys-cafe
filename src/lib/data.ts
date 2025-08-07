export interface Meal {
  id: number;
  name: string;
  category: 'Burgers' | 'Desserts' | 'Healthy Bowls' | 'Sides';
  price: number;
  image: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  dataAiHint: string;
}

export const meals: Meal[] = [
  {
    id: 1,
    name: 'Classic Beef Burger',
    category: 'Burgers',
    price: 12.99,
    image: 'https://placehold.co/600x400.png',
    macros: { calories: 650, protein: 40, carbs: 45, fats: 30 },
    dataAiHint: 'beef burger',
  },
  {
    id: 2,
    name: 'Grilled Chicken Burger',
    category: 'Burgers',
    price: 11.99,
    image: 'https://placehold.co/600x400.png',
    macros: { calories: 550, protein: 45, carbs: 42, fats: 20 },
    dataAiHint: 'chicken burger',
  },
  {
    id: 3,
    name: 'Quinoa & Kale Bowl',
    category: 'Healthy Bowls',
    price: 14.50,
    image: 'https://placehold.co/600x400.png',
    macros: { calories: 480, protein: 20, carbs: 60, fats: 18 },
    dataAiHint: 'quinoa salad',
  },
  {
    id: 4,
    name: 'Salmon & Avocado Bowl',
    category: 'Healthy Bowls',
    price: 16.99,
    image: 'https://placehold.co/600x400.png',
    macros: { calories: 590, protein: 35, carbs: 40, fats: 32 },
    dataAiHint: 'salmon bowl',
  },
  {
    id: 5,
    name: 'Protein Brownie',
    category: 'Desserts',
    price: 5.99,
    image: 'https://placehold.co/600x400.png',
    macros: { calories: 250, protein: 20, carbs: 25, fats: 12 },
    dataAiHint: 'chocolate brownie',
  },
  {
    id: 6,
    name: 'Greek Yogurt Parfait',
    category: 'Desserts',
    price: 6.50,
    image: 'https://placehold.co/600x400.png',
    macros: { calories: 300, protein: 25, carbs: 35, fats: 8 },
    dataAiHint: 'yogurt parfait',
  },
  {
    id: 7,
    name: 'Sweet Potato Fries',
    category: 'Sides',
    price: 4.99,
    image: 'https://placehold.co/600x400.png',
    macros: { calories: 350, protein: 5, carbs: 55, fats: 13 },
    dataAiHint: 'sweet potato',
  },
  {
    id: 8,
    name: 'Side Salad',
    category: 'Sides',
    price: 3.99,
    image: 'https://placehold.co/600x400.png',
    macros: { calories: 150, protein: 3, carbs: 10, fats: 10 },
    dataAiHint: 'green salad',
  },
  {
    id: 9,
    name: 'BBQ Bacon Burger',
    category: 'Burgers',
    price: 13.99,
    image: 'https://placehold.co/600x400.png',
    macros: { calories: 720, protein: 42, carbs: 48, fats: 35 },
    dataAiHint: 'bbq burger',
  },
  {
    id: 10,
    name: 'Veggie Deluxe Burger',
    category: 'Burgers',
    price: 10.99,
    image: 'https://placehold.co/600x400.png',
    macros: { calories: 480, protein: 25, carbs: 52, fats: 18 },
    dataAiHint: 'veggie burger',
  },
  {
    id: 11,
    name: 'Buddha Bowl',
    category: 'Healthy Bowls',
    price: 14.50,
    image: 'https://placehold.co/600x400.png',
    macros: { calories: 480, protein: 20, carbs: 60, fats: 18 },
    dataAiHint: 'quinoa salad',
  },
{
    id: 12,
    name: 'Mango Mousse Cake',
    category: 'Desserts',
    price: 14.50,
    image: 'https://placehold.co/600x400.png',
    macros: { calories: 480, protein: 20, carbs: 60, fats: 18 },
    dataAiHint: 'quinoa salad',
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
        total: 24.98,
        status: 'Delivered',
        date: new Date('2024-07-20T10:30:00'),
        items: [{ mealName: 'Classic Beef Burger', quantity: 2, price: 12.99 }],
    },
    {
        id: 'ORD002',
        customerName: 'Jane Smith',
        total: 31.49,
        status: 'Pending',
        date: new Date('2024-07-21T11:00:00'),
        items: [
            { mealName: 'Salmon & Avocado Bowl', quantity: 1, price: 16.99 },
            { mealName: 'Protein Brownie', quantity: 1, price: 5.99 },
            { mealName: 'Side Salad', quantity: 1, price: 3.99 },
        ],
    },
    {
        id: 'ORD003',
        customerName: 'Mike Johnson',
        total: 14.50,
        status: 'Pending',
        date: new Date('2024-07-21T12:15:00'),
        items: [{ mealName: 'Quinoa & Kale Bowl', quantity: 1, price: 14.50 }],
    },
     {
        id: 'ORD004',
        customerName: 'Emily Davis',
        total: 42.47,
        status: 'Delivered',
        date: new Date('2024-07-20T14:00:00'),
        items: [
            { mealName: 'Grilled Chicken Burger', quantity: 2, price: 11.99 },
            { mealName: 'Sweet Potato Fries', quantity: 2, price: 4.99 },
        ],
    },
     {
        id: 'ORD005',
        customerName: 'Chris Brown',
        total: 18.50,
        status: 'Cancelled',
        date: new Date('2024-07-19T09:00:00'),
        items: [
            { mealName: 'Greek Yogurt Parfait', quantity: 2, price: 6.50 },
            { mealName: 'Protein Brownie', quantity: 1, price: 5.99 },
        ],
    }
];
