// Compile-time tests: these assertions fail at tsc time if types drift.
// Run with: npx tsc --noEmit src/types/content.test.ts
import type {
  ArticleFrontMatter,
  FaqFrontMatter,
  LocalPageFrontMatter,
  ContentType,
  LatestArticleDTO,
} from './content';

// Test 1: ArticleFrontMatter requires all mandatory fields.
const article: ArticleFrontMatter = {
  title: 'Test',
  description: 'Test',
  date: '2026-04-15',
  slug: 'test',
  published: true,
};
void article;

// Test 2: LocalPageFrontMatter requires ville + prestation in addition to base fields.
const local: LocalPageFrontMatter = {
  title: 'Test',
  description: 'Test',
  slug: 'test',
  ville: 'paris',
  prestation: 'renovation-complete',
  published: false,
};
void local;

// Test 3: ContentType is a strict union — must accept only the 3 literals.
const t1: ContentType = 'article';
const t2: ContentType = 'faq';
const t3: ContentType = 'local';
void t1; void t2; void t3;

// Test 4: LatestArticleDTO is frozen — any shape change breaks Flutter.
const dto: LatestArticleDTO = {
  title: 'x', slug: 'x', date: '2026-04-15', description: 'x', url: 'https://x',
};
void dto;

// Test 5: FaqFrontMatter requires all 4 base fields.
const faq: FaqFrontMatter = {
  title: 'FAQ SiO2',
  description: 'Questions fréquentes',
  slug: 'faq',
  published: true,
};
void faq;
