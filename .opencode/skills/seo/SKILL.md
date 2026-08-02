---
name: seo
description: Use when optimizing, auditing, or fixing SEO in the NutriZaria Nuxt 3 storefront — meta tags, title/description, canonical URLs, Open Graph / Twitter cards, JSON-LD structured data (Organization, Product, BreadcrumbList, FAQPage, BlogPosting), sitemap.xml, robots.txt, and semantic heading/alt-text improvements. Trigger keywords: seo, meta tags, canonical, og tags, json-ld, structured data, schema, sitemap, robots, noindex, microdata.
---

# NutriZaria SEO Skill

The NutriZaria storefront is a **Nuxt 3** app (SSR) using Vue `useHead` /
`useSeoMeta` via @unhead/vue, Pinia stores (`stores/catalog.ts`,
`stores/blog.ts`), and a NestJS backend on Railway. The canonical production
origin is **`https://nutrizaria.com`**. Always use absolute URLs in head tags
and structured data.

## When to use

- Any SEO-related change: titles, descriptions, canonical, OG/Twitter, JSON-LD.
- Adding/removing a page and wiring it into search coverage (sitemap, robots).
- Auditing metadata, structured data, heading hierarchy, or image alt text.

## Golden rules

1. **One source of truth for page meta.** Every page should call the shared
   `useSeo()` composable (`composables/useSeo.ts`), never raw `useHead` blocks
   with hard-coded fragments. `useSeo` composes `useSeoMeta` + `useHead` and
   applies: `title`, `titleTemplate`, `description`, canonical, OG (title,
   description, image, url, type, site_name, locale), Twitter card, and optional
   `jsonld` array.
2. **Absolute URLs everywhere.** `useSeo` derives the site base from
   `config.public.siteUrl` (fallback `https://nutrizaria.com`). Prepend it to
   canonical, og:url, og:image, and JSON-LD URLs. Never emit `/images/x.avif`
   or relative paths into head tags.
3. **Public pages get indexed; private/transient pages get `noindex`.**
   - Index: home, shop, category, product, blog index, blog post, FAQ, contact.
   - `noindex`: login, signup, profile, favorite, search results, checkout, 404.
4. **`titleTemplate`** is set globally in `nuxt.config.ts` as
   `%s | NutriZaria`. Pages pass only their own title; do not re-append the
   site name manually. For the homepage, pass the full site title and it is
   used as-is via `useSeo({ title: ... })` (see composable for the home switch).
5. **Every page gets a canonical** pointing at itself (strip query strings).
6. **Structured data must match page content** and use valid URLs from the
   resolved image/URL helpers (`useImageUrl().resolve`, `config.public.siteUrl`).

## The shared composable

Signature:

```ts
useSeo({
  title?: string;               // page title (titleTemplate appends " | NutriZaria")
  description?: string;
  image?: string;               // absolute or resolvable image path
  type?: string;                // default "website"
  noindex?: boolean;
  canonicalPath?: string;       // default: current route fullPath (query stripped)
  jsonld?: Record<string, unknown> | Record<string, unknown>[];
})
```

Usage example (product page):

```ts
const { resolve } = useImageUrl();
useSeo({
  title: product.value?.name,
  description: product.value?.description,
  image: product.value?.image ? resolve(product.value.image) : undefined,
  type: "product",
  jsonld: buildProductJsonLd(product.value),
});
```

## JSON-LD templates

### Organization / Store (global, in `composables/useSeo.ts` globalJSONLD or app.vue)

```json
{
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "name": "NutriZaria",
  "url": "https://nutrizaria.com",
  "logo": "https://nutrizaria.com/nutri.png",
  "description": "Authentic, pure food resources for Bangladeshi kitchens — fresh produce, pantry staples and more.",
  "sameAs": ["https://www.facebook.com/", "https://twitter.com/"]
}
```

### Product

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "<name>",
  "image": "<absolute image url>",
  "description": "<description>",
  "sku": "<sku or id>",
  "offers": {
    "@type": "Offer",
    "url": "<absolute product url>",
    "priceCurrency": "BDT",
    "price": "<number>",
    "availability": "<https://schema.org/InStock|OutOfStock>",
    "itemCondition": "https://schema.org/NewCondition"
  }
}
```

Add `aggregateRating`/`review` only when real review data exists — never fake it.

### BreadcrumbList (product & category pages)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://nutrizaria.com/" },
    { "@type": "ListItem", "position": 2, "name": "Shop", "item": "https://nutrizaria.com/shop" },
    { "@type": "ListItem", "position": 3, "name": "<name>", "item": "<absolute page url>" }
  ]
}
```

### FAQPage (pages/faq.vue, from `catalog.faqs`)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "<question>", "acceptedAnswer": { "@type": "Answer", "text": "<answer>" } }
  ]
}
```

### BlogPosting (pages/blog/[slug].vue)

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "<title>",
  "image": "<absolute image url>",
  "datePublished": "<ISO date>",
  "author": { "@type": "Person", "name": "<writer>" },
  "publisher": { "@type": "Organization", "name": "NutriZaria", "logo": { "@type": "ImageObject", "url": "https://nutrizaria.com/nutri.png" } },
  "mainEntityOfPage": "<absolute url>"
}
```

## Sitemap & robots

- Sitemap is a **Nitro server route** at `server/routes/sitemap.xml.ts` that
  fetches live products/categories from the backend API (`/products?limit=200`,
  `/categories`) plus static routes (/, /shop, /blog, /faq, /contact) and emits
  `<url><loc>...`. If the API is unreachable it falls back to static routes only.
- `robots.txt` is served by `server/routes/robots.txt.ts`, pointing to
  `/sitemap.xml`. Both are SSR routes — do NOT add them to `public/` (a stale
  static `public/robots.txt` would shadow the route; remove it if present).
- Base URL for both is `config.public.siteUrl`.

## Verification checklist

1. `npm run build` passes; then `node .output/server/index.mjs` and curl:
   - `curl -s http://localhost:3000/shop | grep -o '<title>[^<]*</title>'`
   - `curl -s http://localhost:3000/products/<slug> | grep -c 'application/ld+json'`
   - `curl -s http://localhost:3000/sitemap.xml | head`
   - `curl -s http://localhost:3000/robots.txt`
2. Every public page has exactly one `<link rel="canonical">`, one `<title>`,
   one meta description, and valid `og:*` + `twitter:*` tags.
3. Private pages render `<meta name="robots" content="noindex,...">`.
4. Validate structured data with Google's Rich Results Test / Schema.org
   validator before deploy.

## Common pitfalls

- Using relative URLs in `og:image`/JSON-LD — always `siteUrl + path`.
- Forgetting `noindex` on search/checkout/profile pages.
- Duplicate titles: rely on the global `titleTemplate`, never append the brand.
- Hard-coded OG image: products/categories must use their own resolved image,
  falling back to `siteUrl + /nutri.png` only when none exists.
- Editing head inside a `<script>` block instead of via `useSeo`/`useHead`.
