// src/app/(content)/articles/[slug]/page.tsx
// Individual article page — renders a single article with JSON-LD structured data.
//
// Route: /articles/[slug]
// Layout: inherits (content)/layout.tsx — white background, sticky cream header
//
// SECURITY NOTE on dangerouslySetInnerHTML:
//   This file uses dangerouslySetInnerHTML in two contexts:
//   1. JSON-LD script tags: objects constructed from validated front matter fields (title, description,
//      date, slug) — these are validated by validateFrontMatter() at build time (throws on invalid).
//   2. article.html: HTML produced by the remark/rehype pipeline from git-committed markdown files.
//      Content is reviewed manually by a human before git commit — never from user input.
//   Neither context accepts or processes user-submitted data. No sanitization library is needed here.
//   If user-submitted markdown is ever added to this pipeline, rehype-sanitize MUST be added first.
//
// Key architectural decisions (STATE.md + RESEARCH.md):
//
//   1. dynamicParams = false: Only slugs returned by generateStaticParams() are valid.
//      Any other slug resolves to a Next.js 404 automatically — no notFound() needed at runtime
//      for undefined slugs, BUT we still call notFound() when getArticleBySlug() returns null
//      to handle edge cases (race condition between build and deploy, draft articles, etc.).
//
//   2. params is a Promise in Next.js 15+: MUST be `await params` before accessing `.slug`.
//      Synchronous `params.slug` access is a breaking change that causes a runtime error.
//      Both generateMetadata() and the default export MUST await params separately.
//
//   3. runtime = 'edge' is FORBIDDEN: src/lib/content.ts uses fs.readFileSync (Node.js only).
//      Edge runtime would crash at build time.

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllArticles, getArticleBySlug } from '@/lib/content';

// Disable runtime fallback for unknown slugs.
// Next.js will automatically return 404 for any slug not in generateStaticParams().
// This is required for correct SEO behavior — draft/deleted articles must never resolve.
export const dynamicParams = false;

/**
 * generateStaticParams — tells Next.js which slug values to pre-render at build time.
 * Only published articles are returned (getAllArticles() filters published:false).
 * The draft article (fixture-published-false.md) is excluded from this list.
 */
export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

/**
 * generateMetadata — returns per-article SEO metadata.
 *
 * CRITICAL: params is a Promise in Next.js 15+ — must be awaited before accessing .slug.
 * Returns {} for unknown slugs (generateMetadata runs before the component,
 * but dynamicParams=false means this case only occurs in edge scenarios).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  // await params is mandatory — Next.js 15+ breaking change (D-10 in RESEARCH.md)
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `https://hub.sio2renovations.com/articles/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.date,
      url: `https://hub.sio2renovations.com/articles/${slug}`,
      siteName: 'SiO2 Renovations Hub',
    },
  };
}

/**
 * ArticlePage — async Server Component rendering a single article.
 *
 * Renders:
 *   1. Two JSON-LD script tags: Article schema + BreadcrumbList schema
 *   2. Article header: formatted date + h1 title
 *   3. Article body: HTML from remark/rehype pipeline (prose-lg, max-w-3xl)
 *   4. CTA section: cream glassmorphic card with devis / phone / email buttons
 */
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // await params is mandatory — Next.js 15+ breaking change (D-10 in RESEARCH.md)
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  // notFound() for null articles — handles edge cases not caught by dynamicParams=false
  if (!article) notFound();

  // -- JSON-LD: Article schema ------------------------------------------
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      '@type': 'Organization',
      name: 'SiO2 Renovations',
      url: 'https://www.sio2renovations.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SiO2 Renovations',
      logo: {
        '@type': 'ImageObject',
        url: 'https://hub.sio2renovations.com/black_logo.svg',
      },
    },
    url: `https://hub.sio2renovations.com/articles/${article.slug}`,
    ...(article.cover ? { image: article.cover } : {}),
  };

  // -- JSON-LD: BreadcrumbList schema -----------------------------------
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://hub.sio2renovations.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Articles',
        item: 'https://hub.sio2renovations.com/articles',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `https://hub.sio2renovations.com/articles/${article.slug}`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD — Article schema for Google rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {/* JSON-LD — BreadcrumbList for search result navigation display */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article>
        {/* Publication date — French locale, UTC-safe parsing */}
        <time
          dateTime={article.date}
          style={{
            color: '#b0956b',
            fontSize: 13,
            fontFamily: 'var(--font-be-vietnam)',
          }}
        >
          {new Date(article.date + 'T00:00:00').toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>

        {/* Article title */}
        <h1
          className="text-2xl font-bold mt-2 mb-6"
          style={{ color: '#1e1b17', fontFamily: 'var(--font-be-vietnam)' }}
        >
          {article.title}
        </h1>

        {/* Article HTML body — from remark/rehype pipeline, trusted server-side content */}
        {/* prose-lg: larger base font for comfortable reading on article pages            */}
        {/* max-w-3xl: constrain line length on desktop for optimal readability            */}
        {/* H2/H3 sizes set explicitly via Tailwind Typography prose-headings utilities    */}
        <div
          className="prose prose-lg max-w-3xl mb-10
            prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-lg prose-h3:font-medium prose-h3:mt-6 prose-h3:mb-3
            prose-p:mb-5"
          style={{
            color: '#544435',
            lineHeight: 1.85,
            fontFamily: 'var(--font-be-vietnam)',
          }}
          dangerouslySetInnerHTML={{ __html: article.html }}
        />
      </article>

      {/* CTA section — cream glassmorphic card with three contact options */}
      {/* Identical structure to the CTA block in [ville]/[prestation]/page.tsx */}
      <section
        className="rounded-xl p-6 flex flex-col items-center gap-6"
        style={{
          background: '#f9f3eb',
          boxShadow: '0 35px 70px -5px rgba(30,27,23,0.06)',
        }}
      >
        {/* Lead text */}
        <p
          className="text-center font-medium"
          style={{ fontFamily: 'var(--font-be-vietnam)', color: '#544435', fontSize: 15 }}
        >
          Besoin d&apos;un devis pour votre projet ?
        </p>

        {/* Primary CTA — links to main sio2renovations.com site */}
        <a
          href="https://www.sio2renovations.com/contact"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            borderRadius: 9999,
            border: '1px solid #f39220',
            background: 'rgba(255,255,255,0.5)',
            padding: '10px 20px',
            color: '#1e1b17',
            fontSize: 14,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Demander un devis
        </a>

        {/* Secondary CTAs — phone and email in a 2-column grid */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          {/* Phone CTA */}
          <a
            href="tel:0756888701"
            className="rounded-lg p-4 flex flex-col items-center gap-1 transition-all hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.5)',
              color: '#1e1b17',
              textDecoration: 'none',
            }}
          >
            {/* Phone icon — Unicode telephone symbol, orange accent */}
            <span style={{ color: '#f39220', fontSize: 20 }}>&#9742;</span>
            <span
              className="text-xs font-medium"
              style={{ fontFamily: 'var(--font-be-vietnam)' }}
            >
              Appeler
            </span>
          </a>

          {/* Email CTA */}
          <a
            href="mailto:contact@sio2renovations.com"
            className="rounded-lg p-4 flex flex-col items-center gap-1 transition-all hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.5)',
              color: '#1e1b17',
              textDecoration: 'none',
            }}
          >
            {/* Envelope icon — Unicode envelope symbol, orange accent */}
            <span style={{ color: '#f39220', fontSize: 20 }}>&#9993;</span>
            <span
              className="text-xs font-medium"
              style={{ fontFamily: 'var(--font-be-vietnam)' }}
            >
              Email
            </span>
          </a>
        </div>
      </section>
    </>
  );
}
