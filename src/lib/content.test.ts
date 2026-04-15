// Unit tests for lib/content.ts — run with: npx tsx --test src/lib/content.test.ts
// Uses Node.js built-in test runner (node --test) via tsx for TypeScript.
// No jest/vitest installed — keep the dependency footprint minimal for phase 1.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAllArticles,
  getArticleBySlug,
  getAllLocalPages,
  getLatestArticles,
  getAllFaqQuestions,
  validateFrontMatter,
  markdownToHtml,
} from './content';

// -- getAllArticles -------------------------------------------------------

test('getAllArticles returns a non-empty list when seed article exists', async () => {
  const articles = await getAllArticles();
  assert.ok(Array.isArray(articles), 'getAllArticles must return an array');
  assert.ok(articles.length >= 1, 'at least the seed article must be present');
});

test('getAllArticles filters out published: false', async () => {
  const articles = await getAllArticles();
  for (const a of articles) {
    assert.equal(a.published, true, `article ${a.slug} has published=false but appeared in getAllArticles`);
  }
});

// -- getArticleBySlug ------------------------------------------------------

test('getArticleBySlug returns a rendered Article for known slug', async () => {
  const a = await getArticleBySlug('renovation-appartement-paris-guide-complet');
  assert.ok(a !== null, 'seed article must be found');
  assert.equal(typeof a!.title, 'string');
  assert.ok(a!.html.length > 50, 'rendered html must not be empty');
});

test('getArticleBySlug returns null for unknown slug', async () => {
  const a = await getArticleBySlug('slug-inexistant-xyz-12345');
  assert.equal(a, null);
});

// -- getLatestArticles -----------------------------------------------------

test('getLatestArticles(n) returns at most n items sorted desc by date', async () => {
  const latest = await getLatestArticles(3);
  assert.ok(latest.length <= 3);
  for (let i = 1; i < latest.length; i++) {
    assert.ok(latest[i - 1].date >= latest[i].date, 'dates must be sorted desc');
  }
});

// -- getAllLocalPages ------------------------------------------------------

test('getAllLocalPages returns the Paris seed page', async () => {
  const pages = await getAllLocalPages();
  const paris = pages.find((p) => p.ville === 'paris' && p.prestation === 'renovation-complete');
  assert.ok(paris, 'seed local page paris/renovation-complete must be present');
});

// -- getAllFaqQuestions ----------------------------------------------------

test('getAllFaqQuestions returns only published entries', async () => {
  const entries = await getAllFaqQuestions();
  assert.ok(entries.length >= 3, 'seed FAQ must have multiple questions');
  for (const e of entries) assert.equal(e.published, true);
});

// -- validateFrontMatter ---------------------------------------------------

test('validateFrontMatter throws when required field is missing (article)', () => {
  assert.throws(
    () => validateFrontMatter({ title: 'x' }, 'article', 'test.md'),
    /Missing field/,
  );
});

test('validateFrontMatter accepts a complete article front matter', () => {
  assert.doesNotThrow(() =>
    validateFrontMatter(
      { title: 't', description: 'd', date: '2026-04-15', slug: 's', published: true },
      'article',
      'test.md',
    ),
  );
});

test('validateFrontMatter throws on local page missing ville/prestation', () => {
  assert.throws(
    () =>
      validateFrontMatter(
        { title: 't', description: 'd', slug: 's', published: true },
        'local',
        'test.md',
      ),
    /ville|prestation/,
  );
});

// -- markdownToHtml --------------------------------------------------------

test('markdownToHtml converts headings and paragraphs', async () => {
  const html = await markdownToHtml('# Titre\n\nParagraphe ici.');
  assert.match(html, /<h1/);
  assert.match(html, /<p>Paragraphe ici\.<\/p>/);
});

test('markdownToHtml supports GFM tables (remark-gfm)', async () => {
  const md = '| col1 | col2 |\n|------|------|\n| a | b |';
  const html = await markdownToHtml(md);
  assert.match(html, /<table>/);
});
