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
import Image from 'next/image';
import type { Metadata } from 'next';
import { getAllArticles, getArticleBySlug } from '@/lib/content';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';

// Strips HTML tags and estimates reading time at 200 wpm, minimum 1 minute.
function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const wordCount = text.split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

// Splits article HTML into { body, faqItems }.
// body = prose without the FAQ section (injected into the prose block).
// faqItems = extracted Q&A pairs with answerHtml for accordion rendering.
// Looks for an H2 containing "questions" (case-insensitive) as the FAQ boundary.
// Returns faqItems: null when no FAQ section is detected — accordions are not rendered.
function splitArticleHtml(html: string): {
  body: string;
  faqItems: Array<{ question: string; answerHtml: string }> | null;
} {
  const strip = (s: string) => s.replace(/<[^>]+>/g, '').trim();
  const faqIdx = html.search(/<h2[^>]*>[^<]*[Qq]uestions[^<]*<\/h2>/);
  if (faqIdx === -1) return { body: html, faqItems: null };
  const body = html.slice(0, faqIdx);
  const afterFaq = html.slice(faqIdx);
  const afterFaqHeading = afterFaq.slice(afterFaq.indexOf('</h2>') + 5);
  const nextH2 = afterFaqHeading.search(/<h2[^>]*>/);
  const faqSection = nextH2 > -1 ? afterFaqHeading.slice(0, nextH2) : afterFaqHeading;
  const pattern = /<h3[^>]*>([\s\S]*?)<\/h3>\s*(<p[\s\S]*?<\/p>)/g;
  const faqItems = [...faqSection.matchAll(pattern)]
    .map((m) => ({ question: strip(m[1]), answerHtml: m[2] }))
    .filter((item) => item.question && item.answerHtml);
  return { body, faqItems: faqItems.length > 0 ? faqItems : null };
}

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
      ...(article.cover ? { images: [{ url: article.cover }] } : {}),
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

  if (!article) notFound();

  const readingTime = estimateReadingTime(article.html);
  const { body, faqItems } = splitArticleHtml(article.html);

  // -- JSON-LD: Article schema ------------------------------------------
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.lastUpdated ?? article.date,
    author: {
      '@type': 'Person',
      name: article.author ?? 'SiO2 Renovations',
      ...(article.authorTitle ? { jobTitle: article.authorTitle } : {}),
      url: 'https://www.sio2renovations.com/about',
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

  // -- JSON-LD: FAQPage schema — only injected when FAQ section detected --
  // Google uses this for FAQ rich snippets in search results (accordion display).
  // Extraction is automatic via extractFaqFromHtml — no manual frontmatter needed.
  const faqJsonLd = faqItems && faqItems.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(({ question, answerHtml }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answerHtml.replace(/<[^>]+>/g, '').trim() },
        })),
      }
    : null;

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
      {/* JSON-LD — FAQPage for Google FAQ rich snippets (only when FAQ section present) */}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <article>
        {/* ── Header ── */}
        <header className="mb-8">
          {/* Tags — pill chips, orange palette */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded-full px-3 py-1 text-xs font-medium tracking-wide"
                  style={{
                    background: '#fff3e0',
                    color: '#8c4f00',
                    border: '1px solid #ffdcbf',
                    fontFamily: 'var(--font-be-vietnam)',
                  }}
                >
                  {tag.replace(/-/g, '\u00a0')}
                </span>
              ))}
            </div>
          )}

          {/* H1 — Plus Jakarta Sans, large */}
          <h1
            className="text-2xl md:text-3xl font-bold leading-tight mb-4"
            style={{ color: '#1e1b17', fontFamily: 'var(--font-plus-jakarta)' }}
          >
            {article.title}
          </h1>

          {/* Description — subtitle, muted brown */}
          <p
            className="text-base leading-relaxed mb-5"
            style={{ color: '#544435', fontFamily: 'var(--font-be-vietnam)' }}
          >
            {article.description}
          </p>

          {/* Meta row — date · reading time · reviewed_by */}
          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
            style={{ color: '#b0956b', fontFamily: 'var(--font-be-vietnam)' }}
          >
            <time dateTime={article.date}>
              {new Date(article.date + 'T00:00:00').toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            {article.lastUpdated && article.lastUpdated !== article.date && (
              <>
                <span aria-hidden>·</span>
                <span>
                  Mis à jour le{' '}
                  <time dateTime={article.lastUpdated}>
                    {new Date(article.lastUpdated + 'T00:00:00').toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </span>
              </>
            )}
            <span aria-hidden>·</span>
            <span>{readingTime} min de lecture</span>
            {article.author && (
              <>
                <span aria-hidden>·</span>
                <span>
                  <a
                    href="https://www.sio2renovations.com/about"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#b0956b', textDecoration: 'underline', textUnderlineOffset: 3 }}
                  >
                    {article.author}
                  </a>
                  {article.authorTitle && (
                    <span style={{ color: '#b0956b', opacity: 0.75 }}>{', '}{article.authorTitle}</span>
                  )}
                </span>
              </>
            )}
          </div>
        </header>

        {/* ── Cover image — 16/9, rounded, full width ── */}
        {article.cover && (
          <div
            className="relative w-full overflow-hidden rounded-2xl mb-10"
            style={{ aspectRatio: '16/9' }}
          >
            <Image
              src={article.cover}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* ── Article body — prose without FAQ section ── */}
        <div
          className="prose md:prose-lg max-w-none mb-10"
          style={{ fontFamily: 'var(--font-be-vietnam)' }}
          dangerouslySetInnerHTML={{ __html: body }}
        />

        {/* ── YouTube embed — rendered when youtubeId is set in frontmatter ── */}
        {article.youtubeId && (
          <div className="mb-10 overflow-hidden rounded-2xl" style={{ aspectRatio: '16/9' }}>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${article.youtubeId}`}
              title="Vidéo de rénovation"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none', display: 'block' }}
            />
          </div>
        )}

        {/* ── FAQ accordions — même style que la page /faq ── */}
        {faqItems && (
          <section className="mb-10">
            <h2
              className="text-xl font-bold mb-5"
              style={{ color: '#1e1b17', fontFamily: 'var(--font-plus-jakarta)' }}
            >
              Questions fréquentes
            </h2>
            <div className="flex flex-col gap-3">
              {faqItems.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-xl overflow-hidden"
                  style={{ background: '#f9f3eb', border: '1px solid rgba(218,194,175,0.4)', boxShadow: '0 2px 8px rgba(30,27,23,0.04)' }}
                >
                  <summary
                    className="cursor-pointer px-6 py-5 font-medium list-none flex items-center justify-between gap-4 hover:bg-[#f0e8dc] transition-colors"
                    style={{ color: '#1e1b17', fontFamily: 'var(--font-be-vietnam)', fontSize: 15 }}
                  >
                    {item.question}
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-lg font-light transition-transform group-open:rotate-45"
                      style={{ background: 'rgba(243,146,32,0.15)', color: '#f39220' }}
                    >
                      +
                    </span>
                  </summary>
                  <div style={{ borderTop: '1px solid rgba(218,194,175,0.4)' }}>
                    <div
                      className="px-6 py-5 prose prose-base max-w-none"
                      style={{ color: '#544435', lineHeight: 1.75, fontFamily: 'var(--font-be-vietnam)' }}
                      dangerouslySetInnerHTML={{ __html: item.answerHtml }}
                    />
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}
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
            className="flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 hover:bg-[#ffdcbf] hover:scale-105 hover:shadow-md"
            style={{
              background: 'rgba(255,255,255,0.5)',
              color: '#1e1b17',
              textDecoration: 'none',
            }}
          >
            {/* Phone icon — Font Awesome faPhone, orange accent */}
            <FontAwesomeIcon icon={faPhone} style={{ color: '#f39220', fontSize: 22, marginBottom: 8 }} />
            <span
              className="text-xs font-bold"
              style={{ fontFamily: 'var(--font-be-vietnam)' }}
            >
              Appeler
            </span>
          </a>

          {/* Email CTA */}
          <a
            href="mailto:contact@sio2renovations.com"
            className="flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 hover:bg-[#ffdcbf] hover:scale-105 hover:shadow-md"
            style={{
              background: 'rgba(255,255,255,0.5)',
              color: '#1e1b17',
              textDecoration: 'none',
            }}
          >
            {/* Envelope icon — Font Awesome faEnvelope, orange accent */}
            <FontAwesomeIcon icon={faEnvelope} style={{ color: '#f39220', fontSize: 22, marginBottom: 8 }} />
            <span
              className="text-xs font-bold"
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
