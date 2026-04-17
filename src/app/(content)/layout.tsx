// src/app/(content)/layout.tsx
// Nested layout for the (content) route group — wraps all content pages (/articles, /faq, /[ville]/[prestation]).
//
// Purpose:
//   The root layout has a fixed video background at z-index -10 with a dark overlay at -5.
//   Content pages need a clean white background for readability — this nested layout achieves
//   that by placing a `min-h-screen bg-white` div on top of the fixed layers (positive stacking
//   context, no z-index needed since it renders in normal flow above fixed elements).
//
// Design tokens (from page.tsx and CONTEXT.md D-03, D-05, D-06):
//   - Header background: #f9f3eb (surface-container-low)
//   - Body text color: #544435
//   - Font: var(--font-be-vietnam) (set in root layout on <body>)
//
// This is a Server Component — no "use client". No <html>, <head>, or <body> tags
// since this is NESTED under root layout which already provides the document shell.

import Link from 'next/link';
import Image from 'next/image';

/**
 * ContentLayout — shared shell for all (content) route group pages.
 * Provides:
 *   1. White background that visually covers the root layout's fixed video background
 *   2. Sticky cream header with logo (left) and "← Retour" link (right)
 *   3. Centered content area (max-w-2xl) for optimal reading width
 */
export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // White surface covering the fixed video background from root layout
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-be-vietnam)' }}>
      {/* Sticky header — stays at top as user scrolls through long articles */}
      <header
        className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
        style={{
          background: '#f9f3eb',
          borderBottom: '1px solid rgba(218,194,175,0.3)',
        }}
      >
        {/* Left: logo linking back to hub home */}
        <Link href="/" aria-label="Retour à l'accueil SiO2 Rénovations">
          <Image
            src="/black_logo.svg"
            alt="SiO2 Renovations"
            width={56}
            height={56}
            className="w-10 h-10 md:w-14 md:h-14"
          />
        </Link>

        {/* Right: text navigation link back to hub home */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          style={{ color: '#544435', fontSize: 14 }}
        >
          {/* Left arrow entity ← followed by label */}
          &larr; Retour
        </Link>
      </header>

      {/* Main content area — centered, readable width, comfortable vertical padding */}
      <main className="max-w-3xl mx-auto px-6 md:px-10 py-10 md:py-14">
        {children}
      </main>
    </div>
  );
}
