-- ZiCash GH Limited - Comprehensive Database Schema
-- Optimized for Supabase PostgreSQL with RLS and dynamic settings

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- PROFILES: Customer identity and location data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  contact TEXT,
  location TEXT,
  avatar_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  accuracy DOUBLE PRECISION,
  google_maps_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PRODUCTS: Main hardware catalog
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  image_urls TEXT[],
  featured BOOLEAN DEFAULT FALSE,
  warranty TEXT DEFAULT '1 Year ZiCash Warranty',
  stock_status TEXT DEFAULT 'In Stock',
  price NUMERIC NOT NULL DEFAULT 0,
  specs TEXT,
  advanced_specs JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PRODUCT VARIANTS: Specific configurations (e.g. i7 vs i5)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  price NUMERIC NOT NULL,
  stock INTEGER DEFAULT 0,
  cpu TEXT,
  ram TEXT,
  storage TEXT,
  gpu TEXT,
  screen TEXT,
  touchscreen BOOLEAN DEFAULT FALSE,
  keyboard_light BOOLEAN DEFAULT FALSE,
  fingerprint BOOLEAN DEFAULT FALSE,
  condition TEXT DEFAULT 'New',
  chipset TEXT,
  color TEXT,
  battery TEXT,
  network TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISCOUNTS: Time-sensitive price reductions
CREATE TABLE IF NOT EXISTS public.discounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  variant_id UUID REFERENCES public.product_variants ON DELETE CASCADE NOT NULL UNIQUE,
  discount_price NUMERIC NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ORDERS: Transaction history
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'Pending',
  payment_type TEXT NOT NULL, -- 'POD' or 'Prepayment'
  momo_sender_name TEXT,
  payment_screenshot_url TEXT,
  is_accra BOOLEAN DEFAULT TRUE,
  shipping_region TEXT,
  shipping_area TEXT,
  shipping_community TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  extra_notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- REVIEWS: Customer feedback
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- SLIDESHOW: Homepage banners
CREATE TABLE IF NOT EXISTS public.slideshow_slides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  link TEXT,
  link_type TEXT DEFAULT 'internal', -- 'internal', 'external', 'whatsapp'
  is_active BOOLEAN DEFAULT TRUE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SETTINGS: Global store configuration (Momo, Socials)
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slideshow_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES (Fixing UPSERT logic by splitting into INSERT and UPDATE)

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Products
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (auth.jwt()->>'email' IN ('zicashonline@gmail.com', 'ericboatenglucky@gmail.com'));

-- Settings
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON public.settings;
CREATE POLICY "Settings are viewable by everyone" ON public.settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL USING (auth.jwt()->>'email' IN ('zicashonline@gmail.com', 'ericboatenglucky@gmail.com'));

-- Orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (auth.jwt()->>'email' IN ('zicashonline@gmail.com', 'ericboatenglucky@gmail.com'));

-- 5. SEED DATA (Social Links)
INSERT INTO public.settings (key, value)
VALUES (
  'social_links',
  '{
    "instagram": "https://www.instagram.com/cashizz_xr?igsh=YncwY2x1M2lna3Nw",
    "snapchat": "https://www.snapchat.com/add/cashizz_xr?share_id=i6QQMWFhZZw&locale=en-US",
    "tiktok": "https://www.tiktok.com/@cashizz_xr?_r=1&_t=ZS-96lDTWWL67k",
    "linkedin": "https://www.linkedin.com/in/kassim-fouseni-3971272b4?utm_source=share_via&utm_content=profile&utm_medium=member_android"
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
