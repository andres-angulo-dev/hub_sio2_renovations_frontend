// src/lib/content.ts
// Keystone content module — the single source of truth for reading /content/.
// Every route handler, sitemap.ts, and /api/latest endpoint lives downstream of this file.
//
// Architectural decisions (STATE.md Key Decisions):
//   - ESM-only imports for remark/rehype (research/PITFALLS.md — breaks with require())
//   - validateFrontMatter throws at build time when required fields are missing
//     so a malformed file fails the build, never publishes corrupted HTML
//   - published: false entries are filtered out of every public-facing list
//     (articles, latest, local pages, FAQ)
//   - FAQ content lives in a single JSON file (/content/faq/questions.json)
//     because it is structured Q&A, not prose — decision locked in STATE.md gaps
//
// Runtime constraint (research/PITFALLS.md):
//   This file uses fs.readFileSync / fs.readdirSync — Node.js runtime only.
//   Any route importing from '@/lib/content' MUST NOT set runtime = 'edge'.
//
// Security note (research/STACK.md):
//   The HTML string produced by markdownToHtml is trusted because content origin
//   is Claude API output reviewed manually before git commit — never user input.
//   Consumers inject it into the DOM via server-rendered HTML only. Do NOT accept
//   user-submitted markdown through this pipeline without first adding rehype-sanitize.

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

import type {
  Article,
  ArticleFrontMatter,
  ContentType,
  FaqEntry,
  LocalPage,
  LocalPageFrontMatter,
} from '@/types/content';

// Absolute path to the /content directory, resolved once at module load.
// process.cwd() is the project root at both build time (Vercel) and dev time (next dev).
const CONTENT_ROOT = path.join(process.cwd(), 'content');

// -- Front matter validation ----------------------------------------------

// Per-type required fields. Mirror PITFALLS.md table (lines 71-82) and keep in sync
// with src/types/content.ts. Any drift between this list and the interface is a bug.
const REQUIRED_FIELDS: Record<ContentType, readonly string[]> = {
  article: ['title', 'description', 'date', 'slug', 'published'],
  faq: ['title', 'description', 'slug', 'published'],
  local: ['title', 'description', 'slug', 'ville', 'prestation', 'published'],
};

/**
 * Throws when the provided data object is missing any required field for the given content type.
 * Called inside every loader so a malformed file FAILS THE BUILD instead of silently publishing
 * undefined values in <title> tags (PITFALLS.md: gray-matter returns undefined for absent fields).
 *
 * The `published` field is special: it must be a boolean, and missing it defaults to undefined
 * (truthy in no case), which we treat as an invalid file — force authors to be explicit.
 */
export function validateFrontMatter(
  data: Record<string, unknown>,
  type: ContentType,
  file: string,
): void {
  for (const field of REQUIRED_FIELDS[type]) {
    const value = data[field];
    if (field === 'published') {
      if (typeof value !== 'boolean') {
        throw new Error(
          `[validateFrontMatter] Missing field "published" (must be boolean) in ${file}`,
        );
      }
    } else {
      if (value === undefined || value === null || value === '') {
        throw new Error(`[validateFrontMatter] Missing field "${field}" in ${file}`);
      }
    }
  }
}

// -- Markdown pipeline ----------------------------------------------------

/**
 * Converts a markdown string to HTML using the unified/remark/rehype pipeline.
 * Runs at build time (Node.js runtime). Output is a raw HTML string, injected via
 * a server-rendered HTML block in Server Components (no client-side rendering).
 *
 * Pipeline:
 *   remark-parse      -> markdown AST
 *   remark-gfm        -> GFM extensions (tables, footnotes, task lists)
 *   remark-rehype     -> convert markdown AST to HTML AST
 *   rehype-stringify  -> serialise HTML AST to string
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}

// -- Filesystem helpers ---------------------------------------------------

/**
 * Reads all .md files in a directory (non-recursive).
 * Returns an empty array if the directory does not exist — callers decide whether
 * that is a build-breaking condition (the seed files in plan 01 guarantee non-empty).
 */
function readMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(dir, entry.name));
}

/**
 * Recursively walks a directory and returns all .md files found.
 * Used for /content/local/ because pages are nested under /content/local/[ville]/[prestation].md.
 */
function walkMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMarkdownFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

// -- Articles -------------------------------------------------------------

/**
 * Returns all published articles, sorted by date descending (most recent first).
 * Each article includes the rendered HTML body — ready to be injected into a page.
 * Drafts (published: false) are filtered out.
 */
export async function getAllArticles(): Promise<Article[]> {
  const dir = path.join(CONTENT_ROOT, 'article');
  const files = readMarkdownFiles(dir);
  const articles: Article[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const { data, content } = matter(raw);
    validateFrontMatter(data, 'article', file);
    const fm = data as ArticleFrontMatter;
    if (!fm.published) continue; // drop drafts
    const html = await markdownToHtml(content);
    articles.push({ ...fm, html });
  }
  // Sort by ISO date descending — ISO 8601 strings compare lexicographically correctly.
  articles.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return articles;
}

/**
 * Returns a single article matching the slug, or null if not found or unpublished.
 * Unknown slugs return null (NOT throw) — callers decide to return notFound() in Next.js.
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const all = await getAllArticles();
  return all.find((a) => a.slug === slug) ?? null;
}

/**
 * Returns the N most recent published articles. Used by:
 *   - /api/latest  (Flutter consumer — phase 3, FLUTTER-01)
 *   - <LatestArticles /> on hub home (phase 3, HUB-01)
 *
 * Default N = 5 matches the /api/latest contract (LatestArticleDTO, 5 items).
 */
export async function getLatestArticles(n: number = 5): Promise<Article[]> {
  const all = await getAllArticles();
  return all.slice(0, n);
}

// -- Local pages ----------------------------------------------------------

/**
 * Returns all published local service pages (e.g. /paris/renovation-complete).
 * Reads recursively from /content/local/ because files are nested [ville]/[prestation].md.
 */
export async function getAllLocalPages(): Promise<LocalPage[]> {
  const dir = path.join(CONTENT_ROOT, 'local');
  const files = walkMarkdownFiles(dir);
  const pages: LocalPage[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const { data, content } = matter(raw);
    validateFrontMatter(data, 'local', file);
    const fm = data as LocalPageFrontMatter;
    if (!fm.published) continue;
    const html = await markdownToHtml(content);
    pages.push({ ...fm, html });
  }
  return pages;
}

/**
 * Returns a single local page matching (ville, prestation) pair, or null.
 * Used by generateStaticParams in /[ville]/[prestation]/page.tsx (phase 2).
 */
export async function getLocalPageBySlug(
  ville: string,
  prestation: string,
): Promise<LocalPage | null> {
  const all = await getAllLocalPages();
  return all.find((p) => p.ville === ville && p.prestation === prestation) ?? null;
}

// -- FAQ ------------------------------------------------------------------

/**
 * Reads /content/faq/questions.json and returns every published question.
 * FAQ is structured as a single JSON file (decision: STATE.md gaps — structured
 * Q&A is not prose, so markdown + front matter would add overhead for no benefit).
 * Each answer is still markdown → rendered to HTML per entry.
 */
export async function getAllFaqQuestions(): Promise<(FaqEntry & { html: string })[]> {
  const file = path.join(CONTENT_ROOT, 'faq', 'questions.json');
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = JSON.parse(raw) as {
    title: string;
    description: string;
    slug: string;
    published: boolean;
    questions: FaqEntry[];
  };
  validateFrontMatter(parsed, 'faq', file);
  if (!parsed.published) return [];
  const entries: (FaqEntry & { html: string })[] = [];
  for (const q of parsed.questions) {
    if (!q.published) continue;
    const html = await markdownToHtml(q.answer);
    entries.push({ ...q, html });
  }
  return entries;
}
