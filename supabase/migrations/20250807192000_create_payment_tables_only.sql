-- Create payment_intents table
CREATE TABLE IF NOT EXISTS payment_intents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd' NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'requires_capture', 'canceled', 'succeeded', 'failed')),
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  shipping_address JSONB,
  order_items JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal INTEGER NOT NULL, -- Amount in cents
  tax INTEGER DEFAULT 0, -- Amount in cents
  shipping INTEGER DEFAULT 0, -- Amount in cents
  total INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd' NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'canceled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_intent_id UUID REFERENCES payment_intents(id),
  notes TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  default_shipping_address JSONB,
  total_orders INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0, -- Amount in cents
  first_order_date TIMESTAMP WITH TIME ZONE,
  last_order_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'card', 'bank_account', etc.
  card_brand TEXT, -- 'visa', 'mastercard', etc.
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_tracking table
CREATE TABLE IF NOT EXISTS order_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_intents_stripe_id ON payment_intents(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_customer_email ON payment_intents(customer_email);
CREATE INDEX IF NOT EXISTS idx_payment_intents_created_at ON payment_intents(created_at);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON orders(payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_total_spent ON customers(total_spent);
CREATE INDEX IF NOT EXISTS idx_customers_last_order_date ON customers(last_order_date);

CREATE INDEX IF NOT EXISTS idx_payment_methods_customer_id ON payment_methods(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_id ON payment_methods(stripe_payment_method_id);

CREATE INDEX IF NOT EXISTS idx_order_tracking_order_id ON order_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_created_at ON order_tracking(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Payment intents: Admin can see all, customers can see their own
CREATE POLICY "Admin can view all payment intents" ON payment_intents
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Customers can view their own payment intents" ON payment_intents
  FOR SELECT USING (customer_email = auth.jwt() ->> 'email');

CREATE POLICY "Service role can manage payment intents" ON payment_intents
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Orders: Admin can see all, customers can see their own
CREATE POLICY "Admin can view all orders" ON orders
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Customers can view their own orders" ON orders
  FOR SELECT USING (customer_email = auth.jwt() ->> 'email');

CREATE POLICY "Service role can manage orders" ON orders
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Customers: Admin can see all, users can see their own
CREATE POLICY "Admin can view all customers" ON customers
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view their own customer record" ON customers
  FOR SELECT USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Service role can manage customers" ON customers
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Payment methods: Admin can see all, customers can see their own
CREATE POLICY "Admin can view all payment methods" ON payment_methods
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Customers can view their own payment methods" ON payment_methods
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM customers 
    WHERE customers.id = payment_methods.customer_id 
    AND customers.email = auth.jwt() ->> 'email'
  ));

CREATE POLICY "Service role can manage payment methods" ON payment_methods
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Order tracking: Admin can see all, customers can see their own orders
CREATE POLICY "Admin can view all order tracking" ON order_tracking
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Customers can view their own order tracking" ON order_tracking
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_tracking.order_id 
    AND orders.customer_email = auth.jwt() ->> 'email'
  ));

CREATE POLICY "Service role can manage order tracking" ON order_tracking
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_payment_intents_updated_at BEFORE UPDATE ON payment_intents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update customer statistics
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update customer statistics when an order is created or updated
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.payment_status != NEW.payment_status AND NEW.payment_status = 'paid') THEN
        INSERT INTO customers (email, name, phone, total_orders, total_spent, first_order_date, last_order_date)
        VALUES (
            NEW.customer_email,
            NEW.customer_name,
            NEW.customer_phone,
            1,
            NEW.total,
            NEW.created_at,
            NEW.created_at
        )
        ON CONFLICT (email) DO UPDATE SET
            name = COALESCE(customers.name, NEW.customer_name),
            phone = COALESCE(customers.phone, NEW.customer_phone),
            total_orders = customers.total_orders + 1,
            total_spent = customers.total_spent + NEW.total,
            last_order_date = NEW.created_at;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating customer statistics
CREATE TRIGGER update_customer_stats_trigger
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_stats();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for generating order numbers
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();