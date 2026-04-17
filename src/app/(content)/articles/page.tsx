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
import Image from 'next/image';
import type { Metadata } from 'next';
import { getAllArticles } from '@/lib/content';

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return Math.max(1, Math.ceil(text.split(' ').filter(Boolean).length / 200));
}

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

  const [hero, ...rest] = articles;

  return (
    <section>
      {/* Page heading */}
      <div className="mb-10">
        <h1
          className="text-3xl md:text-4xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-plus-jakarta)', color: '#1e1b17' }}
        >
          Articles
        </h1>
        <p className="text-sm" style={{ color: '#b0956b' }}>
          {articles.length} article{articles.length > 1 ? 's' : ''} publié{articles.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Hero card — premier article en grand format ── */}
      {hero && (
        <Link href={'/articles/' + hero.slug} style={{ textDecoration: 'none' }} className="group block mb-10">
          <article
            className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl"
            style={{
              background: '#f9f3eb',
              border: '1px solid rgba(218,194,175,0.4)',
              boxShadow: '0 4px 20px rgba(30,27,23,0.06)',
            }}
          >
            {/* Cover image hero */}
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
              {hero.cover ? (
                <Image
                  src={hero.cover}
                  alt={hero.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  priority
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{ background: 'linear-gradient(135deg, #fff3e0 0%, #ffdcbf 100%)' }}
                />
              )}
            </div>

            {/* Hero content */}
            <div className="p-6 md:p-8">
              {/* Tags */}
              {hero.tags && hero.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {hero.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded-full px-3 py-1 text-xs font-medium"
                      style={{ background: '#fff3e0', color: '#8c4f00', border: '1px solid #ffdcbf', fontFamily: 'var(--font-be-vietnam)' }}
                    >
                      {tag.replace(/-/g, '\u00a0')}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h2
                className="text-2xl md:text-3xl font-bold leading-tight mb-3 group-hover:text-[#8c4f00] transition-colors"
                style={{ fontFamily: 'var(--font-plus-jakarta)', color: '#1e1b17' }}
              >
                {hero.title}
              </h2>

              {/* Description */}
              <p className="text-base mb-5 line-clamp-2" style={{ color: '#544435', fontFamily: 'var(--font-be-vietnam)', lineHeight: 1.7 }}>
                {hero.description}
              </p>

              {/* Meta row */}
              <div className="flex items-center gap-3 text-sm" style={{ color: '#b0956b', fontFamily: 'var(--font-be-vietnam)' }}>
                <time dateTime={hero.date}>
                  {new Date(hero.date + 'T00:00:00').toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
                <span aria-hidden>·</span>
                <span>{estimateReadingTime(hero.html)} min de lecture</span>
                <span
                  className="ml-auto text-base transition-transform group-hover:translate-x-1"
                  style={{ color: '#f39220' }}
                >
                  →
                </span>
              </div>
            </div>
          </article>
        </Link>
      )}

      {/* ── Grille 2 colonnes — articles suivants ── */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rest.map((article) => (
            <Link key={article.slug} href={'/articles/' + article.slug} style={{ textDecoration: 'none' }} className="group block">
              <article
                className="h-full rounded-xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  background: '#f9f3eb',
                  border: '1px solid rgba(218,194,175,0.4)',
                  boxShadow: '0 2px 8px rgba(30,27,23,0.04)',
                }}
              >
                {/* Cover image */}
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  {article.cover ? (
                    <Image
                      src={article.cover}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ background: 'linear-gradient(135deg, #fff3e0 0%, #ffdcbf 100%)' }}
                    />
                  )}
                </div>

                {/* Card content */}
                <div className="p-5">
                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ background: '#fff3e0', color: '#8c4f00', border: '1px solid #ffdcbf', fontFamily: 'var(--font-be-vietnam)' }}
                        >
                          {tag.replace(/-/g, '\u00a0')}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h2
                    className="text-lg font-semibold leading-snug mb-2 group-hover:text-[#8c4f00] transition-colors"
                    style={{ fontFamily: 'var(--font-plus-jakarta)', color: '#1e1b17' }}
                  >
                    {article.title}
                  </h2>

                  {/* Description */}
                  <p className="text-sm line-clamp-2 mb-4" style={{ color: '#544435', fontFamily: 'var(--font-be-vietnam)', lineHeight: 1.7 }}>
                    {article.description}
                  </p>

                  {/* Meta row */}
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#b0956b', fontFamily: 'var(--font-be-vietnam)' }}>
                    <time dateTime={article.date}>
                      {new Date(article.date + 'T00:00:00').toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </time>
                    <span aria-hidden>·</span>
                    <span>{estimateReadingTime(article.html)} min de lecture</span>
                    <span
                      className="ml-auto transition-transform group-hover:translate-x-1"
                      style={{ color: '#f39220' }}
                    >
                      →
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
