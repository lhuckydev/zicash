-- ZiCash GH Limited - Production Database Schema
-- Use IF NOT EXISTS to prevent errors during re-application

-- 1. PROFILES (Customer Data)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    full_name text,
    email text,
    contact text,
    location text,
    avatar_url text,
    latitude float8,
    longitude float8,
    accuracy float8,
    google_maps_link text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. PRODUCTS (Main Catalog)
CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    brand text,
    category text NOT NULL,
    description text,
    image_url text NOT NULL,
    image_urls text[],
    price float8 NOT NULL DEFAULT 0,
    featured boolean DEFAULT false,
    warranty text DEFAULT '1 Year ZiCash Warranty',
    stock_status text DEFAULT 'In Stock',
    specs text,
    advanced_specs jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. PRODUCT VARIANTS (Hardware Configurations)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid REFERENCES public.products ON DELETE CASCADE NOT NULL,
    label text NOT NULL,
    price float8 NOT NULL,
    stock integer NOT NULL DEFAULT 0,
    cpu text,
    ram text,
    storage text,
    gpu text,
    screen text,
    touchscreen boolean DEFAULT false,
    keyboard_light boolean DEFAULT false,
    fingerprint boolean DEFAULT false,
    condition text DEFAULT 'New',
    chipset text,
    color text,
    battery text,
    network text,
    is_default boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 4. DISCOUNTS (Hot Deals Engine)
CREATE TABLE IF NOT EXISTS public.discounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    variant_id uuid REFERENCES public.product_variants ON DELETE CASCADE NOT NULL UNIQUE,
    discount_price float8 NOT NULL,
    ends_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 5. ORDERS (Transaction History)
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE SET NULL,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    total_amount numeric NOT NULL,
    status text DEFAULT 'Pending',
    payment_type text NOT NULL,
    momo_sender_name text,
    payment_screenshot_url text,
    is_accra boolean DEFAULT true,
    extra_notes text,
    shipping_region text,
    shipping_area text,
    shipping_community text,
    latitude float8,
    longitude float8,
    items jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- 6. SETTINGS (Global Config & Social Links)
CREATE TABLE IF NOT EXISTS public.settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 7. REVIEWS (Customer Feedback)
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid REFERENCES public.products ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    rating integer CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamptz DEFAULT now(),
    UNIQUE(product_id, user_id)
);

-- 8. CARTS & WISHLISTS (Persistent Sessions)
CREATE TABLE IF NOT EXISTS public.carts (
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    items jsonb DEFAULT '[]'::jsonb,
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wishlists (
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    items jsonb DEFAULT '[]'::jsonb,
    updated_at timestamptz DEFAULT now()
);

-- 9. SLIDESHOW (Marketing Banners)
CREATE TABLE IF NOT EXISTS public.slideshow_slides (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url text NOT NULL,
    title text,
    subtitle text,
    link text,
    link_type text DEFAULT 'internal',
    is_active boolean DEFAULT true,
    position integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- SEED INITIAL DATA
INSERT INTO public.settings (key, value)
VALUES ('social_links', '{
  "instagram": "https://www.instagram.com/cashizz_xr?igsh=YncwY2x1M2lna3Nw",
  "snapchat": "https://www.snapchat.com/add/cashizz_xr?share_id=i6QQMWFhZZw&locale=en-US",
  "tiktok": "https://www.tiktok.com/@cashizz_xr?_r=1&_t=ZS-96lDTWWL67k",
  "linkedin": "https://www.linkedin.com/in/kassim-fouseni-3971272b4?utm_source=share_via&utm_content=profile&utm_medium=member_android"
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS POLICIES (BASIC)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings are viewable by everyone" ON public.settings FOR SELECT USING (true);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Variants are viewable by everyone" ON public.product_variants FOR SELECT USING (true);

ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Discounts are viewable by everyone" ON public.discounts FOR SELECT USING (true);

ALTER TABLE public.slideshow_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Slides are viewable by everyone" ON public.slideshow_slides FOR SELECT USING (true);