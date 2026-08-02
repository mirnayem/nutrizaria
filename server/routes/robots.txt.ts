export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const base = (config.public.siteUrl || "https://nutrizaria.com").replace(/\/+$/, "");

  setHeader(event, "Content-Type", "text/plain; charset=utf-8");

  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /checkout",
    "Disallow: /profile",
    "Disallow: /favorite",
    "Disallow: /search",
    "Disallow: /login",
    "Disallow: /signup",
    "",
    `Sitemap: ${base}/sitemap.xml`,
  ].join("\n");
});
