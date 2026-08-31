// scripts/publish-social-posts.js
// Publishes the drafts produced by generate-social-posts.js to the SiO2
// Facebook Page and LinkedIn organization page.
// Usage: node scripts/publish-social-posts.js social-posts.json
//
// Environment:
//   DRY_RUN=true           log what would be posted, call no API (default when unset)
//   FB_PAGE_ID             Facebook Page id
//   FB_PAGE_TOKEN          long-lived Page access token (pages_manage_posts)
//   LINKEDIN_ORG_ID        numeric organization id (urn:li:organization:<id>)
//   LINKEDIN_TOKEN         OAuth token with w_organization_social
//
// A network whose credentials are absent is skipped with a warning instead of
// failing the job — this allows the staged rollout (Facebook first, LinkedIn
// once the Community Management API access is approved).

const fs = require('fs');

const DRY_RUN = process.env.DRY_RUN !== 'false';
// Pinned Graph API / LinkedIn versions — bump deliberately, not implicitly.
const FB_API = 'https://graph.facebook.com/v21.0';
const LI_API = 'https://api.linkedin.com/rest/posts';
const LI_VERSION = '202508';

async function postToFacebook(post) {
  const { FB_PAGE_ID, FB_PAGE_TOKEN } = process.env;
  if (DRY_RUN) {
    console.log(`[facebook] DRY-RUN — would post for ${post.slug}:\n${post.facebook}\n`);
    return 'dry-run';
  }
  if (!FB_PAGE_ID || !FB_PAGE_TOKEN) {
    console.warn(`[facebook] SKIPPED (credentials not configured): ${post.slug}`);
    return 'skipped';
  }
  const res = await fetch(`${FB_API}/${FB_PAGE_ID}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: post.facebook, link: post.url, access_token: FB_PAGE_TOKEN }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`[facebook] ${post.slug}: HTTP ${res.status} — ${JSON.stringify(body)}`);
  console.log(`[facebook] published ${post.slug} → post id ${body.id}`);
  return 'published';
}

async function postToLinkedIn(post) {
  const { LINKEDIN_ORG_ID, LINKEDIN_TOKEN } = process.env;
  if (DRY_RUN) {
    console.log(`[linkedin] DRY-RUN — would post for ${post.slug}:\n${post.linkedin}\n`);
    return 'dry-run';
  }
  if (!LINKEDIN_ORG_ID || !LINKEDIN_TOKEN) {
    console.warn(`[linkedin] SKIPPED (credentials not configured): ${post.slug}`);
    return 'skipped';
  }
  const res = await fetch(LI_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINKEDIN_TOKEN}`,
      'LinkedIn-Version': LI_VERSION,
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: `urn:li:organization:${LINKEDIN_ORG_ID}`,
      commentary: post.linkedin,
      visibility: 'PUBLIC',
      distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
      content: { article: { source: post.url, title: post.title } },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[linkedin] ${post.slug}: HTTP ${res.status} — ${body}`);
  }
  // LinkedIn returns the post URN in the x-restli-id header, with an empty body.
  console.log(`[linkedin] published ${post.slug} → ${res.headers.get('x-restli-id')}`);
  return 'published';
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/publish-social-posts.js <social-posts.json>');
    process.exit(1);
  }
  const posts = JSON.parse(fs.readFileSync(file, 'utf-8'));
  if (posts.length === 0) {
    console.log('No posts to publish.');
    return;
  }
  console.log(`Mode: ${DRY_RUN ? 'DRY-RUN (no API called)' : 'LIVE'} — ${posts.length} article(s)\n`);

  // Publish sequentially and keep going on per-network failures: one broken
  // token must not block the other network. Failures still fail the job at
  // the end so they are visible in CI.
  const errors = [];
  for (const post of posts) {
    for (const publish of [postToFacebook, postToLinkedIn]) {
      try {
        await publish(post);
      } catch (err) {
        console.error(String(err));
        errors.push(String(err));
      }
    }
  }
  if (errors.length > 0) {
    console.error(`\n${errors.length} publication(s) failed.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
