// src/app/(content)/[ville]/[prestation]/page.tsx
// Dynamic route for local service pages — /[ville]/[prestation] (e.g. /paris/renovation-complete).
//
// Purpose:
//   Primary local SEO asset targeting city+service keyword combinations.
//   Each published markdown file under /content/local/[ville]/[prestation].md
//   generates one static page at build time.
//
// Architecture decisions (PITFALLS.md, STATE.md):
//   - dynamicParams = false: unknown ville/prestation pairs return 404 automatically.
//     No need to call notFound() for every unknown route — Next.js handles it.
//     We still call notFound() defensively if getLocalPageBySlug returns null.
//   - await params: Next.js 15+ breaking change — params is now a Promise.
//     BOTH generateMetadata AND the default export must await params independently.
//   - generateStaticParams returns ONLY actual markdown file pairs from getAllLocalPages(),
//     NOT a Cartesian product of all villes × all prestations (would generate phantom routes).
//   - Two dynamic segments require two awaits — each function awaits its own params Promise.
//
// JSON-LD schemas:
//   - LocalBusiness + HomeAndConstructionBusiness: describes the company + areaServed scoped
//     to the specific city (NOT all of Île-de-France — prevents schema dilution).
//   - hasOfferCatalog with nested Service: describes the specific service on this page.
//   - BreadcrumbList: signals page hierarchy to Google (Accueil → page title).
//
// SECURITY: dangerouslySetInnerHTML injects content from git-committed markdown files
//   processed at build time. Content origin is reviewed manually before git commit —
//   never user input. See src/lib/content.ts lines 17-22.

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllLocalPages, getLocalPageBySlug } from '@/lib/content';

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return Math.max(1, Math.ceil(text.split(' ').filter(Boolean).length / 200));
}

function formatSlug(slug: string): string {
  return slug.replace(/-/g, '\u00a0').replace(/\b\w/g, (c) => c.toUpperCase());
}

// -- Static generation config ------------------------------------------------

/**
 * dynamicParams = false: any [ville]/[prestation] pair NOT returned by generateStaticParams
 * will automatically return a 404, without needing explicit notFound() in every path.
 * Set at module level so Next.js reads it at build time (not runtime).
 */
export const dynamicParams = false;

// -- Static params generation ------------------------------------------------

/**
 * generateStaticParams — tells Next.js which [ville]/[prestation] pairs to pre-render.
 *
 * CRITICAL: Returns ONLY pairs that have a corresponding markdown file in /content/local/.
 * NOT a Cartesian product of all villes × all prestations — that would create phantom routes
 * (e.g. /paris/isolation if that file doesn't exist, causing a 404 at runtime despite
 * being in the static params list). See PITFALLS.md: generateStaticParams gotchas.
 */
export async function generateStaticParams() {
  const pages = await getAllLocalPages();
  return pages.map((page) => ({
    ville: page.ville,
    prestation: page.prestation,
  }));
}

// -- Per-page metadata -------------------------------------------------------

/**
 * generateMetadata — returns SEO metadata for each ville+prestation pair.
 *
 * Next.js 15+ breaking change: params is a Promise — must be awaited.
 * Returns empty metadata object if page not found (dynamicParams=false handles the 404).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ ville: string; prestation: string }>;
}): Promise<Metadata> {
  const { ville, prestation } = await params;
  const page = await getLocalPageBySlug(ville, prestation);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: `https://hub.sio2renovations.com/${ville}/${prestation}`,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      type: 'website',
      url: `https://hub.sio2renovations.com/${ville}/${prestation}`,
      siteName: 'SiO2 Renovations Hub',
    },
  };
}

// -- Page component ----------------------------------------------------------

/**
 * LocalServicePage — async Server Component for /[ville]/[prestation].
 *
 * Renders:
 *   1. LocalBusiness+HomeAndConstructionBusiness JSON-LD (company + city service)
 *   2. BreadcrumbList JSON-LD (hierarchy signal for Google)
 *   3. Article content (h1 + rendered markdown body)
 *   4. CTA section (devis link + phone + email buttons)
 */
export default async function LocalServicePage({
  params,
}: {
  params: Promise<{ ville: string; prestation: string }>;
}) {
  // Next.js 15+: params is a Promise — await it first.
  // Two dynamic segments ([ville] and [prestation]) — both destructured from one await.
  const { ville, prestation } = await params;

  // Look up the published local page matching this ville+prestation pair.
  const page = await getLocalPageBySlug(ville, prestation);

  // Defensive notFound() — dynamicParams=false already handles unknown pairs,
  // but this guard catches edge cases (e.g. page unpublished after build cache).
  if (!page) notFound();

  // Capitalize the ville name for display in JSON-LD (e.g. "paris" → "Paris").
  // Replace hyphens with spaces for multi-word city names (e.g. "saint-denis" → "Saint Denis").
  const villeName =
    page.ville.charAt(0).toUpperCase() + page.ville.slice(1).replace(/-/g, ' ');

  // -- JSON-LD: LocalBusiness + Service ----------------------------------------
  // areaServed is scoped to the specific city (NOT generic Île-de-France).
  // hasOfferCatalog with nested Service links the company schema to the specific service.
  const localJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
    name: 'SiO2 Renovations',
    description: page.description,
    url: 'https://www.sio2renovations.com',
    telephone: '+33756888701',
    email: 'contact@sio2renovations.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Paris',
      addressRegion: 'Ile-de-France',
      addressCountry: 'FR',
    },
    areaServed: {
      '@type': 'City',
      name: villeName,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services de renovation',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: page.title,
            description: page.description,
            areaServed: { '@type': 'City', name: villeName },
          },
        },
      ],
    },
  };

  // -- JSON-LD: BreadcrumbList --------------------------------------------------
  // Signals page hierarchy: Accueil → [page title].
  // position values must be integers starting at 1.
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
        name: page.title,
        item: `https://hub.sio2renovations.com/${page.ville}/${page.prestation}`,
      },
    ],
  };

  return (
    <>
      {/* LocalBusiness + Service structured data — scoped to city for local SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localJsonLd) }}
      />

      {/* BreadcrumbList structured data — hierarchy signal */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article>
        {/* ── Header ── */}
        <header className="mb-8">
          {/* Badges ville + prestation */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: '#fff3e0', color: '#8c4f00', border: '1px solid #ffdcbf', fontFamily: 'var(--font-be-vietnam)' }}
            >
              {villeName}
            </span>
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: '#fff3e0', color: '#8c4f00', border: '1px solid #ffdcbf', fontFamily: 'var(--font-be-vietnam)' }}
            >
              {formatSlug(page.prestation)}
            </span>
          </div>

          {/* H1 */}
          <h1
            className="text-3xl md:text-4xl font-bold leading-tight mb-4"
            style={{ color: '#1e1b17', fontFamily: 'var(--font-plus-jakarta)' }}
          >
            {page.title}
          </h1>

          {/* Description subtitle */}
          <p
            className="text-base leading-relaxed mb-5"
            style={{ color: '#544435', fontFamily: 'var(--font-be-vietnam)' }}
          >
            {page.description}
          </p>

          {/* Meta — temps de lecture */}
          <div className="text-sm" style={{ color: '#b0956b', fontFamily: 'var(--font-be-vietnam)' }}>
            {estimateReadingTime(page.html)} min de lecture
          </div>
        </header>

        {/* Rendered markdown body */}
        <div
          className="prose prose-lg max-w-none mb-10"
          style={{ fontFamily: 'var(--font-be-vietnam)' }}
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      </article>

      {/* CTA section — cream glassmorphic card with three contact options */}
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
