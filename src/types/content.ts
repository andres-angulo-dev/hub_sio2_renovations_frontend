// Centralised type contracts for all markdown-driven content in the hub.
// Every content file (.md or .json) must map to one of these interfaces
// once gray-matter has parsed its front matter. These are the single source
// of truth consumed by lib/content.ts, all route handlers, sitemap.ts, and /api/latest.
//
// Decision D-01 (STATE.md): validateFrontMatter must throw at build time when
// a required field is missing. These interfaces are the canonical whitelist.

// Discriminator used by validateFrontMatter() to pick the right schema.
export type ContentType = 'article' | 'faq' | 'local';

// Article front matter — required fields reflect PITFALLS.md (table lines 71-82).
// All fields required: missing any of them must break the build, never render undefined.
export interface ArticleFrontMatter {
  title: string;
  description: string;
  date: string;      // ISO 8601 format "YYYY-MM-DD"
  slug: string;
  published: boolean;
  // Optional editorial metadata — may be added later without breaking schema:
  cover?: string;
  tags?: string[];
  reviewed_by?: string;
  author?: string;
  authorTitle?: string; // e.g. "Commercial en travaux de rénovation, SiO2 Rénovations"
  youtubeId?: string;   // YouTube video ID to embed between article body and FAQ
  lastUpdated?: string; // ISO 8601 "YYYY-MM-DD" — used for freshness signals and dateModified schema
}

// FAQ entry — single question/answer. FaqFrontMatter covers the document-level
// metadata for /content/faq/questions.json; individual questions use FaqEntry below.
export interface FaqFrontMatter {
  title: string;
  description: string;
  slug: string;
  published: boolean;
}

// Individual FAQ question — used inside questions.json.
// Grouped by `category` to render the /faq page with sectioned accordions.
export interface FaqEntry {
  question: string;
  answer: string;      // markdown — rendered via same pipeline as articles
  category: string;
  slug: string;
  published: boolean;
}

// Local service page — /[ville]/[prestation]. ville and prestation are REQUIRED
// because the URL depends on them (generateStaticParams reads these as pairs).
export interface LocalPageFrontMatter {
  title: string;
  description: string;
  slug: string;
  ville: string;        // lowercase, kebab-case: "paris", "boulogne-billancourt"
  prestation: string;   // lowercase, kebab-case: "renovation-complete", "salle-de-bains"
  published: boolean;
  // Optional enrichment:
  reviewed_by?: string;
}

// Union type for generic content loaders — rarely used directly;
// prefer specific types for type safety at call sites.
export type AnyFrontMatter =
  | ArticleFrontMatter
  | FaqFrontMatter
  | LocalPageFrontMatter;

// Rendered article shape — returned by getAllArticles() / getArticleBySlug().
// Includes the parsed HTML body (produced by the remark → rehype pipeline).
export interface Article extends ArticleFrontMatter {
  html: string;       // HTML string produced by markdownToHtml()
}

// Rendered local page shape.
export interface LocalPage extends LocalPageFrontMatter {
  html: string;
}

// Minimal shape returned by /api/latest (consumed by Flutter — phase 5).
// Kept separate from Article to freeze the public API contract.
// See PITFALLS.md "API response shape changes break Flutter silently" — do NOT mutate
// this type without versioning the endpoint.
export interface LatestArticleDTO {
  title: string;
  slug: string;
  date: string;
  description: string;
  url: string;        // absolute URL to hub.sio2renovations.com/articles/[slug]
}
