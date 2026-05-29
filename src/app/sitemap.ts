import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://zicash.online';

  // Core static routes with high priority
  const staticRoutes = [
    { url: '', priority: 1.0, changeFrequency: 'daily' },
    { url: '/products', priority: 0.9, changeFrequency: 'daily' },
    { url: '/flash-sales', priority: 0.9, changeFrequency: 'always' },
    { url: '/categories', priority: 0.8, changeFrequency: 'weekly' },
    { url: '/suggested', priority: 0.8, changeFrequency: 'daily' },
    { url: '/advisor', priority: 0.8, changeFrequency: 'monthly' },
  ].map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency as any,
    priority: route.priority,
  }));

  // Informational routes with lower priority
  const infoRoutes = [
    { url: '/about', priority: 0.5, changeFrequency: 'monthly' },
    { url: '/contact', priority: 0.5, changeFrequency: 'monthly' },
    { url: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { url: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  ].map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency as any,
    priority: route.priority,
  }));

  // Dynamic product routes for SEO depth
  try {
    const { data: products } = await supabase
      .from('products')
      .select('id, updated_at')
      .gt('price', 0);

    const productRoutes = (products || []).map((product) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: new Date(product.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...infoRoutes, ...productRoutes];
  } catch (error) {
    console.error('Sitemap dynamic sync error:', error);
    return [...staticRoutes, ...infoRoutes];
  }
}
