// src/app/(content)/faq/page.tsx
// FAQ page — static Server Component listing all published questions grouped by category.
//
// Purpose:
//   Centralise les réponses aux questions fréquentes pour améliorer la compréhension
//   du contenu par Google (FAQPage JSON-LD) et réduire les demandes de contact répétitives.
//
// Architecture decisions:
//   - Native <details>/<summary> accordions: zero client-side JS, accessible by default,
//     no "use client" needed (progressive enhancement via CSS :open pseudo-class).
//   - FAQ content from @/lib/content.getAllFaqQuestions() which reads /content/faq/questions.json
//     at build time — no runtime filesystem access.
//   - FAQPage JSON-LD uses raw answer text (q.answer), NOT the rendered HTML (q.html).
//     Google expects plain text in acceptedAnswer.text, not HTML markup.
//   - Questions grouped by category using reduce() — order of categories follows first
//     occurrence order in questions.json (no enforced sort, content authors control order).
//
// SECURITY: dangerouslySetInnerHTML injects content from git-committed markdown files
//   processed at build time. Content origin is Claude API output reviewed manually before
//   git commit — never user input. See src/lib/content.ts lines 17-22.

import type { Metadata } from 'next';
import { getAllFaqQuestions } from '@/lib/content';

// -- Static metadata ---------------------------------------------------------

/**
 * Static metadata for the /faq page.
 * Canonical URL prevents duplicate indexing if /faq is linked from multiple sources.
 * Description matches the FAQ JSON top-level description field.
 */
export const metadata: Metadata = {
  title: 'Questions frequentes — SiO2 Renovations',
  description:
    'Les reponses aux questions les plus posees sur nos prestations de renovation en Ile-de-France : delais, devis, assurances, agrements.',
  alternates: {
    canonical: 'https://hub.sio2renovations.com/faq',
  },
  openGraph: {
    title: 'Questions frequentes — SiO2 Renovations',
    description:
      'Reponses aux questions frequentes sur la renovation en Ile-de-France.',
    type: 'website',
    url: 'https://hub.sio2renovations.com/faq',
    siteName: 'SiO2 Renovations Hub',
  },
};

// -- Page component ----------------------------------------------------------

/**
 * FaqPage — async Server Component.
 *
 * Renders:
 *   1. FAQPage JSON-LD script tag for Google rich results (question list in SERPs)
 *   2. H1 heading
 *   3. Questions grouped by category — each category is an H2 section containing
 *      <details>/<summary> accordions (one per question)
 */
export default async function FaqPage() {
  // Load all published FAQ questions from /content/faq/questions.json at build time.
  // Returns (FaqEntry & { html: string })[] — each entry has the answer rendered to HTML
  // (for visual display) and the raw answer markdown string (for JSON-LD).
  const questions = await getAllFaqQuestions();

  // Group questions by category using a reduce accumulator.
  // Preserves first-occurrence order of categories (matches questions.json order).
  const grouped = questions.reduce<Record<string, typeof questions>>(
    (acc, q) => {
      const cat = q.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(q);
      return acc;
    },
    {},
  );

  // Build FAQPage JSON-LD structured data for Google.
  // Uses q.answer (raw markdown text) — NOT q.html (rendered HTML).
  // Google's FAQPage schema expects plain text in acceptedAnswer.text, not HTML entities.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };

  return (
    <>
      {/* FAQPage structured data — consumed by Google for rich results in SERPs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Page heading */}
      <h1
        className="text-3xl font-bold mb-8"
        style={{ fontFamily: 'var(--font-be-vietnam)', color: '#1e1b17' }}
      >
        Questions fréquentes
      </h1>

      {/* Category sections — one section per category, questions as accordions */}
      {Object.entries(grouped).map(([category, categoryQuestions]) => (
        <section key={category} className="mb-10">
          {/* Category header — orange accent matches brand design tokens */}
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: '#f39220', fontFamily: 'var(--font-be-vietnam)' }}
          >
            {category}
          </h2>

          {/* Accordion list for this category */}
          <div className="flex flex-col gap-3">
            {categoryQuestions.map((q) => (
              <details
                key={q.slug}
                className="group border border-[#f9f3eb] rounded-lg"
              >
                {/* Question row — acts as the toggle trigger */}
                <summary
                  className="cursor-pointer px-5 py-4 font-medium text-sm list-none flex items-center justify-between"
                  style={{ color: '#544435', fontFamily: 'var(--font-be-vietnam)' }}
                >
                  {q.question}
                  {/* Chevron rotates 180deg when details is open via group-open: variant */}
                  <span className="ml-2 text-[#b0956b] group-open:rotate-180 transition-transform">
                    &#9662;
                  </span>
                </summary>

                {/* Answer — rendered HTML from markdown pipeline, injected safely (git-committed content) */}
                <div
                  className="px-5 pb-4 text-sm prose prose-sm max-w-none"
                  style={{
                    color: '#544435',
                    lineHeight: 1.65,
                    fontFamily: 'var(--font-be-vietnam)',
                  }}
                  dangerouslySetInnerHTML={{ __html: q.html }}
                />
              </details>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
