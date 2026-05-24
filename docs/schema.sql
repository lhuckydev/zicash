
-- ZiCash Master Schema
-- Version 2.2: Added extra_notes to orders

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  contact TEXT,
  location TEXT,
  avatar_url TEXT,
  latitude DOUBLE PRECISION,
  longitude TEXT,
  accuracy DOUBLE PRECISION,
  google_maps_link TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  image_urls TEXT[],
  specs TEXT,
  condition TEXT DEFAULT 'New',
  clock_speed TEXT,
  screen_resolution TEXT,
  cpu TEXT,
  ram_size TEXT,
  storage_size TEXT,
  gpu TEXT,
  camera TEXT,
  battery TEXT,
  size TEXT,
  material TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  total_amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'Pending',
  payment_type TEXT,
  momo_sender_name TEXT,
  payment_screenshot_url TEXT,
  is_accra BOOLEAN DEFAULT true,
  items JSONB NOT NULL,
  extra_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Carts Table
CREATE TABLE IF NOT EXISTS carts (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  items JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Wishlists Table
CREATE TABLE IF NOT EXISTS wishlists (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  items JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- 6. Storage Buckets (Run in Dashboard: products, avatars, payment-proofs)

-- Idempotent Policy Setup
DO $$ 
BEGIN
    -- Profiles
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
    CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
    CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

    -- Products
    DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
    CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Admins can manage products" ON products;
    CREATE POLICY "Admins can manage products" ON products FOR ALL USING (true);

    -- Orders
    DROP POLICY IF EXISTS "Users can view own orders" ON orders;
    CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
    DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
    CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
    DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
    CREATE POLICY "Admins can view all orders" ON orders FOR ALL USING (true);

    -- Storage Policies (Simplified)
    -- These usually need to be run against storage.objects
END $$;
