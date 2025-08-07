// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
if (!supabaseUrl || !supabaseKey || 
    supabaseUrl === 'your-supabase-project-url' || 
    supabaseKey === 'your-supabase-anon-key') {
  console.warn('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

// Use fallback values for development if not configured
const fallbackUrl = 'https://bdkkvotpjpfxbamdnbyx.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJka2t2b3RwanBmeGJhbWRuYnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1ODY3MDMsImV4cCI6MjA3MDE2MjcwM30.nHz9pt2raSr5wR3jwgy-eKy5WefFctmQN6-OBycf0Cc';

// Create Supabase client with proper configuration
const supabase = createClient(
  supabaseUrl && supabaseUrl !== 'your-supabase-project-url' ? supabaseUrl : fallbackUrl,
  supabaseKey && supabaseKey !== 'your-supabase-anon-key' ? supabaseKey : fallbackKey
);

export { supabase };

// Database types for better TypeScript support
export interface PaymentIntent {
  id: string;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
  customer_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  payment_intent_id?: string;
  total_amount: number;
  status: string;
  items: any[];
  customer_info: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  stripe_customer_id?: string;
  email: string;
  name: string;
  phone?: string;
  address?: Record<string, any>;
  created_at: string;
  updated_at: string;
}