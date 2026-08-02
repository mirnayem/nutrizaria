import { defaultBlogPosts } from "~/data/blogs";
import { blogSlugFromTitle, cleanBackendSlug } from "~/utils/slugify";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const base = (config.public.siteUrl || "https://nutrizaria.com").replace(/\/+$/, "");
  const apiBase = config.public.apiBase;

  const urls: { loc: string; priority: number }[] = [
    { loc: `${base}/`, priority: 1 },
    { loc: `${base}/shop`, priority: 0.9 },
    { loc: `${base}/blog`, priority: 0.7 },
    { loc: `${base}/about`, priority: 0.5 },
    { loc: `${base}/faq`, priority: 0.6 },
    { loc: `${base}/contact`, priority: 0.6 },
    { loc: `${base}/privacy`, priority: 0.4 },
    { loc: `${base}/terms`, priority: 0.4 },
    { loc: `${base}/cookies`, priority: 0.4 },
  ];

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      $fetch(`${apiBase}/products?limit=200`),
      $fetch(`${apiBase}/categories`),
    ]);

    const items = productsRes?.data?.items ?? productsRes?.items ?? [];
    for (const product of items) {
      if (product.isActive === false) continue;
      const slug = product.slug || product.id;
      urls.push({ loc: `${base}/products/${slug}`, priority: 0.9 });
    }

    const categories = categoriesRes?.data ?? categoriesRes ?? [];
    for (const category of categories) {
      if (category.isActive === false) continue;
      if (!category.slug) continue;
      urls.push({ loc: `${base}/categories/${category.slug}`, priority: 0.8 });
    }
  } catch (error) {
    console.warn("[sitemap] API unavailable, using static + blog routes only");
  }

  try {
    const blogRes = await $fetch(`${apiBase}/blogs?limit=200`);
    const blogPayload = blogRes?.data ?? blogRes ?? [];
    const blogItems = Array.isArray(blogPayload) ? blogPayload : blogPayload.items ?? [];
    const seen = new Set<string>();
    for (const post of blogItems) {
      if (post.isPublished === false) continue;
      const clean = blogSlugFromTitle(post.title || "") || cleanBackendSlug(post.slug || "") || String(post.id || "");
      if (!clean || seen.has(clean)) continue;
      seen.add(clean);
      urls.push({ loc: `${base}/blog/${clean}`, priority: 0.7 });
    }
  } catch (error) {
    for (const post of defaultBlogPosts) {
      if (!post.slug) continue;
      urls.push({ loc: `${base}/blog/${post.slug}`, priority: 0.7 });
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${escapeXml(u.loc)}</loc><priority>${u.priority}</priority></url>`)
    .join("\n")}\n</urlset>`;

  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  setHeader(event, "Cache-Control", "public, max-age=3600, s-maxage=3600");
  return body;
});
