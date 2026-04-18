import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/_next/', '/api/'],
    },
    sitemap: 'https://hub.sio2renovations.com/sitemap.xml',
  };
}
