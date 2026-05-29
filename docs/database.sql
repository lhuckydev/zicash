-- ZiCash GH Limited Full System Schema
-- Primary SQL script for marketplace synchronization

-- 1. Profiles & Identities
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  contact TEXT,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  accuracy DOUBLE PRECISION,
  google_maps_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Marketplace Products
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  warranty TEXT DEFAULT '1 Year ZiCash Warranty',
  stock_status TEXT DEFAULT 'In Stock',
  advanced_specs JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Hardware Configuration Modules
CREATE TABLE product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  cpu TEXT,
  ram TEXT,
  storage TEXT,
  gpu TEXT,
  screen TEXT,
  chipset TEXT,
  color TEXT,
  battery TEXT,
  network TEXT,
  touchscreen BOOLEAN DEFAULT false,
  keyboard_light BOOLEAN DEFAULT false,
  fingerprint BOOLEAN DEFAULT false,
  condition TEXT DEFAULT 'New',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Dynamic Discount Engine
CREATE TABLE discounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id UUID REFERENCES product_variants ON DELETE CASCADE UNIQUE NOT NULL,
  discount_price DECIMAL(12,2) NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Promotional Slideshow Assets
CREATE TABLE slideshow_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  link TEXT,
  link_type TEXT DEFAULT 'internal', -- 'internal', 'external', 'whatsapp'
  is_active BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Customer Transaction Node
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'Pending',
  payment_type TEXT NOT NULL,
  momo_sender_name TEXT,
  payment_screenshot_url TEXT,
  is_accra BOOLEAN DEFAULT true,
  extra_notes TEXT,
  shipping_region TEXT,
  shipping_area TEXT,
  shipping_community TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Verification & Reviews
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(product_id, user_id)
);

-- 8. Global Configuration Node (MoMo, Socials, etc.)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Initial Seed for Social Links
INSERT INTO settings (key, value) VALUES (
  'social_links',
  '{
    "instagram": "https://www.instagram.com/cashizz_xr?igsh=YncwY2x1M2lna3Nw",
    "snapchat": "https://www.snapchat.com/add/cashizz_xr?share_id=i6QQMWFhZZw&locale=en-US",
    "tiktok": "https://www.tiktok.com/@cashizz_xr?_r=1&_t=ZS-96lDTWWL67k",
    "linkedin": "https://www.linkedin.com/in/kassim-fouseni-3971272b4?utm_source=share_via&utm_content=profile&utm_medium=member_android"
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;
