import { MetadataRoute } from 'next';
import { getAllArticles, getAllLocalPages } from '@/lib/content';

const BASE_URL = 'https://hub.sio2renovations.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, localPages] = await Promise.all([
    getAllArticles(),
    getAllLocalPages(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/articles`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map(article => ({
    url: `${BASE_URL}/articles/${article.slug}`,
    lastModified: new Date(article.lastUpdated ?? article.date),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const localRoutes: MetadataRoute.Sitemap = localPages.map(page => ({
    url: `${BASE_URL}/${page.ville}/${page.prestation}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...articleRoutes, ...localRoutes];
}
