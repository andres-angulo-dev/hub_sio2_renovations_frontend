// src/app/(content)/articles/page.tsx
// Articles index page — lists all published articles sorted by date descending.
//
// Route: /articles
// Layout: inherits (content)/layout.tsx — white background, sticky cream header
//
// SEO strategy:
//   - Static metadata with explicit canonical and openGraph (does NOT inherit root layout's OG image)
//   - The openGraph block is page-specific: type "website", hub URL as canonical source
//
// Data: getAllArticles() reads /content/article/*.md, filters published:true, sorts by date DESC.
// All data is fetched at build time (SSG) — no runtime fetch.

import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllArticles } from '@/lib/content';

// Static metadata for the articles index page.
// Uses explicit canonical URL and openGraph to override root layout defaults.
export const metadata: Metadata = {
  title: 'Articles — SiO2 Renovations',
  description:
    'Guides et conseils renovation : appartement, salle de bains, cuisine, reglementation a Paris et Ile-de-France.',
  alternates: {
    canonical: 'https://hub.sio2renovations.com/articles',
  },
  openGraph: {
    title: 'Articles — SiO2 Renovations',
    description: 'Guides et conseils renovation a Paris et Ile-de-France.',
    type: 'website',
    url: 'https://hub.sio2renovations.com/articles',
    siteName: 'SiO2 Renovations Hub',
  },
};

/**
 * ArticlesPage — async Server Component rendering the published articles list.
 *
 * Each article card displays:
 *   - Formatted date in French (toLocaleDateString 'fr-FR')
 *   - Title (hover: accent orange transition)
 *   - Description excerpt (clamped to 2 lines)
 *
 * The card is fully clickable via a wrapping Link to /articles/[slug].
 * The `+T00:00:00` suffix forces UTC midnight interpretation, avoiding timezone-induced
 * off-by-one day errors when the server is not in the UTC+00 zone.
 */
export default async function ArticlesPage() {
  // Fetch all published articles sorted by date descending
  const articles = await getAllArticles();

  return (
    <section>
      {/* Page heading */}
      <h1
        className="text-3xl font-bold mb-8"
        style={{ fontFamily: 'var(--font-be-vietnam)', color: '#1e1b17' }}
      >
        Articles
      </h1>

      {/* Article cards list */}
      {articles.map((article) => (
        <Link
          key={article.slug}
          href={'/articles/' + article.slug}
          // Remove default link underline — card is fully styled below
          style={{ textDecoration: 'none' }}
        >
          <article className="group border-b border-[#f9f3eb] pb-6 mb-6 last:border-b-0">
            {/* Publication date — French locale, UTC-safe parsing */}
            <time
              dateTime={article.date}
              style={{ color: '#b0956b', fontSize: 13 }}
            >
              {new Date(article.date + 'T00:00:00').toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>

            {/* Article title — accent orange on card hover */}
            <h2
              className="text-lg font-semibold mt-1 group-hover:text-[#f39220] transition-colors"
              style={{ color: '#544435' }}
            >
              {article.title}
            </h2>

            {/* Description excerpt — 2-line clamp for visual rhythm */}
            <p
              className="text-sm mt-2 line-clamp-2"
              style={{ color: '#544435', lineHeight: 1.65 }}
            >
              {article.description}
            </p>
          </article>
        </Link>
      ))}
    </section>
  );
}
