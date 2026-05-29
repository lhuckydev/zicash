-- RE-RUNNABLE DATABASE SCHEMA FOR ZICASH GH LIMITED

-- 1. SETTINGS TABLE (Social Links & Config)
CREATE TABLE IF NOT EXISTS public.settings (
    key text PRIMARY KEY,
    value jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial social links
INSERT INTO public.settings (key, value)
VALUES ('social_links', '{
    "instagram": "https://www.instagram.com/cashizz_xr?igsh=YncwY2x1M2lna3Nw",
    "snapchat": "https://www.snapchat.com/add/cashizz_xr?share_id=i6QQMWFhZZw&locale=en-US",
    "tiktok": "https://www.tiktok.com/@cashizz_xr?_r=1&_t=ZS-96lDTWWL67k",
    "linkedin": "https://www.linkedin.com/in/kassim-fouseni-3971272b4?utm_source=share_via&utm_content=profile&utm_medium=member_android"
}')
ON CONFLICT (key) DO NOTHING;

-- Seed MoMo details
INSERT INTO public.settings (key, value)
VALUES ('momo_payment_details', '{"name": "Kanisatu Fouseni", "number": "0243708691"}')
ON CONFLICT (key) DO NOTHING;

-- 2. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    name text NOT NULL,
    brand text,
    category text NOT NULL,
    description text,
    image_url text NOT NULL,
    image_urls text[] DEFAULT '{}'::text[],
    featured boolean DEFAULT false,
    warranty text DEFAULT '1 Year ZiCash Warranty',
    stock_status text DEFAULT 'In Stock',
    price numeric NOT NULL,
    specs text,
    advanced_specs jsonb DEFAULT '{}'::jsonb
);

DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (
    auth.jwt() ->> 'email' IN ('zicashonline@gmail.com', 'ericboatenglucky@gmail.com')
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS public.product_variants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    label text NOT NULL,
    price numeric NOT NULL,
    stock integer DEFAULT 0,
    cpu text,
    ram text,
    storage text,
    gpu text,
    screen text,
    touchscreen boolean DEFAULT false,
    keyboard_light boolean DEFAULT false,
    fingerprint boolean DEFAULT false,
    chipset text,
    color text,
    battery text,
    network text,
    condition text DEFAULT 'New',
    is_default boolean DEFAULT false
);

DROP POLICY IF EXISTS "Variants are viewable by everyone" ON public.product_variants;
CREATE POLICY "Variants are viewable by everyone" ON public.product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage variants" ON public.product_variants;
CREATE POLICY "Admins can manage variants" ON public.product_variants FOR ALL USING (
    auth.jwt() ->> 'email' IN ('zicashonline@gmail.com', 'ericboatenglucky@gmail.com')
);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- 4. DISCOUNTS
CREATE TABLE IF NOT EXISTS public.discounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE UNIQUE,
    discount_price numeric NOT NULL,
    ends_at timestamp with time zone NOT NULL
);

DROP POLICY IF EXISTS "Discounts are viewable by everyone" ON public.discounts;
CREATE POLICY "Discounts are viewable by everyone" ON public.discounts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage discounts" ON public.discounts;
CREATE POLICY "Admins can manage discounts" ON public.discounts FOR ALL USING (
    auth.jwt() ->> 'email' IN ('zicashonline@gmail.com', 'ericboatenglucky@gmail.com')
);

ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

-- 5. SLIDESHOW SLIDES
CREATE TABLE IF NOT EXISTS public.slideshow_slides (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    image_url text NOT NULL,
    title text,
    subtitle text,
    link text,
    link_type text DEFAULT 'internal',
    is_active boolean DEFAULT true,
    position integer DEFAULT 0
);

DROP POLICY IF EXISTS "Slides are viewable by everyone" ON public.slideshow_slides;
CREATE POLICY "Slides are viewable by everyone" ON public.slideshow_slides FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage slides" ON public.slideshow_slides;
CREATE POLICY "Admins can manage slides" ON public.slideshow_slides FOR ALL USING (
    auth.jwt() ->> 'email' IN ('zicashonline@gmail.com', 'ericboatenglucky@gmail.com')
);

ALTER TABLE public.slideshow_slides ENABLE ROW LEVEL SECURITY;

-- 6. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    email text,
    full_name text,
    avatar_url text,
    contact text,
    location text,
    latitude double precision,
    longitude double precision,
    accuracy double precision,
    google_maps_link text
);

DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
CREATE POLICY "Profiles are viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
    auth.jwt() ->> 'email' IN ('zicashonline@gmail.com', 'ericboatenglucky@gmail.com')
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    total_amount numeric NOT NULL,
    status text DEFAULT 'Pending',
    payment_type text DEFAULT 'Prepayment',
    momo_sender_name text,
    payment_screenshot_url text,
    is_accra boolean DEFAULT false,
    extra_notes text,
    shipping_region text,
    shipping_area text,
    shipping_community text,
    latitude double precision,
    longitude double precision,
    items jsonb DEFAULT '[]'::jsonb
);

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (
    auth.jwt() ->> 'email' IN ('zicashonline@gmail.com', 'ericboatenglucky@gmail.com')
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 8. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    UNIQUE(product_id, user_id)
);

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own reviews" ON public.reviews;
CREATE POLICY "Users can manage own reviews" ON public.reviews FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 9. CARTS & WISHLISTS
CREATE TABLE IF NOT EXISTS public.carts (
    user_id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    items jsonb DEFAULT '[]'::jsonb,
    updated_at timestamp with time zone DEFAULT now()
);

DROP POLICY IF EXISTS "Users can manage own cart" ON public.carts;
CREATE POLICY "Users can manage own cart" ON public.carts FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.wishlists (
    user_id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    items jsonb DEFAULT '[]'::jsonb,
    updated_at timestamp with time zone DEFAULT now()
);

DROP POLICY IF EXISTS "Users can manage own wishlist" ON public.wishlists;
CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;