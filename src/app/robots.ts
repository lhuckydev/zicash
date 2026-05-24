import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/', '/checkout/', '/api/', '/auth/'],
    },
    sitemap: 'https://zicashgh.com/sitemap.xml',
  };
}