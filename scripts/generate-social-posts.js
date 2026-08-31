// scripts/generate-social-posts.js
// Generates Facebook and LinkedIn post drafts for newly added articles.
// Usage: node scripts/generate-social-posts.js content/article/foo.md [more.md...]
// Prints a JSON array to stdout: [{ slug, url, title, facebook, linkedin }]
// Skips drafts (published: false) and the test fixture.
// Run in CI: social-publish.yml pipes the output to social-posts.json, shows the
// drafts in the run summary, and the publish job only runs after manual approval.

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const HUB_BASE_URL = 'https://hub.sio2renovations.com';

// Maps article tags to the hashtag block appended to the LinkedIn draft.
// Facebook gets no hashtags: they add noise there and don't help reach.
function hashtagsFromTags(tags = []) {
  const base = ['#rénovation', '#Paris'];
  if (tags.includes('parties-communes') || tags.includes('copropriete')) base.push('#copropriété', '#syndic');
  if (tags.includes('parquet')) base.push('#parquet');
  if (tags.includes('peinture')) base.push('#peinture');
  if (tags.includes('salle-de-bains')) base.push('#salledebains');
  if (tags.includes('appartement')) base.push('#appartement');
  return [...new Set(base)].join(' ');
}

// Builds both platform drafts from one article's frontmatter.
// The description is written as the article's hook — it doubles as post copy.
function draftsFor(fm) {
  const url = fm.canonical || `${HUB_BASE_URL}/articles/${fm.slug}`;
  // Strip the "(2026)" suffix from titles: useful for SEO, noisy in a social post.
  const title = fm.title.replace(/\s*\(\d{4}\)\s*$/, '');

  const facebook = [
    `📝 Nouvel article : ${title}`,
    '',
    fm.description,
    '',
    `👉 À lire ici : ${url}`,
  ].join('\n');

  const linkedin = [
    `${title}`,
    '',
    fm.description,
    '',
    'Article complet sur notre hub 👇',
    '',
    hashtagsFromTags(fm.tags),
  ].join('\n');

  return { slug: fm.slug, url, title, facebook, linkedin };
}

const files = process.argv.slice(2).filter((f) => !path.basename(f).startsWith('fixture'));
if (files.length === 0) {
  console.error('No article files given — nothing to draft.');
  process.exit(0);
}

const posts = [];
for (const file of files) {
  const raw = fs.readFileSync(file, 'utf-8');
  const { data: fm } = matter(raw);
  if (fm.published !== true) {
    console.error(`Skipping ${file}: published is not true.`);
    continue;
  }
  for (const field of ['title', 'description', 'slug']) {
    if (!fm[field]) {
      console.error(`Skipping ${file}: missing required frontmatter field "${field}".`);
      fm._invalid = true;
      break;
    }
  }
  if (fm._invalid) continue;
  posts.push(draftsFor(fm));
}

process.stdout.write(JSON.stringify(posts, null, 2) + '\n');
