/**
 * @fileOverview Next.js Dynamic Manifest
 * Note: We are using a static /public/manifest.json as the primary authority 
 * to ensure 100% MIME type compatibility and browser detection.
 */
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ZiCash GH Limited',
    short_name: 'ZiCash',
    description: 'Premium Online Marketplace for Ghana. All You Need, All For You.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FBFBFE',
    theme_color: '#2563eb',
    icons: [
      {
        src: 'https://i.ibb.co/v4p0sdxs/zicash.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
        purpose: 'maskable'
      },
      {
        src: 'https://i.ibb.co/v4p0sdxs/zicash.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any'
      }
    ]
  }
}