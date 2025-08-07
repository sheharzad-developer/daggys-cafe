// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bdkkvotpjpfxbamdnbyx.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJka2t2b3RwanBmeGJhbWRuYnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1ODY3MDMsImV4cCI6MjA3MDE2MjcwM30.nHz9pt2raSr5wR3jwgy-eKy5WefFctmQN6-OBycf0Cc';

const supabase = createClient(supabaseUrl, supabaseKey);

// Handle new order notifications
const handleNewOrder = (payload) => {
  console.log('New order received from Supabase:', payload);
  
  // Trigger browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('New Order from Database!', {
      body: `Order #${payload.new.id} from ${payload.new.customer_name}`,
      icon: '/favicon.ico'
    });
  }
  
  // Sound notification
  const audio = new Audio('/notification-sound.mp3');
  audio.play().catch(error => {
    console.log('Audio notification failed:', error);
  });
};

// Listen for new orders
supabase
  .channel('orders')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'orders'
  }, handleNewOrder)
  .subscribe();

export { supabase, handleNewOrder };