import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://zicashgh.com';

  // Core static routes
  const routes = [
    '',
    '/categories',
    '/suggested',
    '/advisor',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic product routes for SEO
  try {
    const { data: products } = await supabase
      .from('products')
      .select('id, updated_at')
      .gt('stock', 0);

    const productRoutes = (products || []).map((product) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: new Date(product.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...routes, ...productRoutes];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return routes;
  }
}