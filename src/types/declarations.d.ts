// Type declarations for non-TypeScript file imports.
// These files are handled by Next.js/webpack at build time,
// but TypeScript needs declarations to resolve them statically.

// Plain CSS files (e.g. globals.css) — side-effect imports only, no exports
declare module "*.css";
