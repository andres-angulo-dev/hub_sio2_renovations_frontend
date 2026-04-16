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
 *   3. Article body: HTML from remark/rehype pipeline
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
        <div
          className="prose prose-sm max-w-none"
          style={{
            color: '#544435',
            lineHeight: 1.75,
            fontFamily: 'var(--font-be-vietnam)',
          }}
          dangerouslySetInnerHTML={{ __html: article.html }}
        />
      </article>
    </>
  );
}
