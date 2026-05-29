
-- Enable RLS
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;

-- Settings Table (for Social Links, etc.)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Settings are viewable by everyone" ON public.settings;
CREATE POLICY "Settings are viewable by everyone" ON public.settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;
CREATE POLICY "Admins can update settings" ON public.settings FOR ALL 
USING (auth.jwt() ->> 'email' IN ('zicashonline@gmail.com', 'ericboatenglucky@gmail.com'));

-- Seed Initial Social Links
INSERT INTO public.settings (key, value)
VALUES ('social_links', '{
    "instagram": "https://www.instagram.com/cashizz_xr?igsh=YncwY2x1M2lna3Nw",
    "snapchat": "https://www.snapchat.com/add/cashizz_xr?share_id=i6QQMWFhZZw&locale=en-US",
    "tiktok": "https://www.tiktok.com/@cashizz_xr?_r=1&_t=ZS-96lDTWWL67k",
    "linkedin": "https://www.linkedin.com/in/kassim-fouseni-3971272b4?utm_source=share_via&utm_content=profile&utm_medium=member_android"
}')
ON CONFLICT (key) DO NOTHING;

-- Policies for other tables (Ensuring clean re-run)
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Variants are viewable by everyone" ON public.product_variants;
CREATE POLICY "Variants are viewable by everyone" ON public.product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE WITH CHECK (auth.uid() = id);
