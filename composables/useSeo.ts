import { computed, unref } from "vue";
import { useHead, useRoute, useRuntimeConfig, useSeoMeta } from "#imports";
import type { MaybeRefOrGetter } from "vue";

type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

export interface UseSeoOptions {
  title?: MaybeRefOrGetter<string>;
  description?: MaybeRefOrGetter<string>;
  image?: MaybeRefOrGetter<string | null>;
  type?: MaybeRefOrGetter<string>;
  noindex?: MaybeRefOrGetter<boolean>;
  canonicalPath?: MaybeRefOrGetter<string>;
  jsonld?: MaybeRefOrGetter<JsonLdValue | null>;
}

export const DEFAULT_TITLE = "NutriZaria - Authentic Pure Food Resources";

export function siteUrl(config?: { public?: { siteUrl?: string } }): string {
  const url = config?.public?.siteUrl || "https://nutrizaria.com";
  return url.replace(/\/+$/, "");
}

export function absoluteUrl(path: string, base?: string): string {
  const b = base ?? "https://nutrizaria.com";
  if (!path) return b;
  if (/^https?:\/\//.test(path)) return path;
  return `${b}${path.startsWith("/") ? path : `/${path}`}`;
}

const read = <T,>(value: MaybeRefOrGetter<T>, fallback?: T): T => {
  const result = unref(typeof value === "function" ? (value as () => T)() : value);
  return (result ?? fallback) as T;
};

const asArray = <T,>(value: T | T[] | null | undefined): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

export function useSeo(options: UseSeoOptions = {}) {
  const route = useRoute();

  // Capture runtime config ONCE during setup. Head getters are evaluated by
  // unhead during render, outside the Nuxt app context, so they must never
  // call composables that require `useNuxtApp()` (e.g. useRuntimeConfig,
  // useImageUrl). Values are captured here as plain strings instead.
  const config = useRuntimeConfig();
  const base = (config.public.siteUrl || "https://nutrizaria.com").replace(/\/+$/, "");
  const apiBase = (config.public.apiBase || "").replace(/\/+$/, "").replace(/\/api$/, "");

  const toAbsolute = (path: string): string => {
    if (!path) return `${base}/nutri.png`;
    if (/^https?:\/\//.test(path)) return path;
    return `${base}${path.startsWith("/") ? path : `/${path}`}`;
  };

  const toResolved = (url: string | null | undefined): string => {
    if (!url) return "";
    const s = String(url).trim();
    if (!s) return "";
    if (/^https?:\/\/localhost:\d+\//.test(s)) {
      try {
        return `${apiBase}${new URL(s).pathname}`;
      } catch {
        return s;
      }
    }
    if (s.includes("://")) return s;
    if (s.startsWith("/uploads/")) return `${apiBase}${s}`;
    if (s.startsWith("/")) return s;
    return `/images/${s}`;
  };

  const resolveSeoImage = (image?: string | null): string => {
    const resolved = toResolved(image);
    if (resolved && !resolved.includes("placeholder")) return toAbsolute(resolved);
    return `${base}/nutri.png`;
  };

  const canonicalPath = computed(() => {
    const explicit = read(options.canonicalPath);
    if (explicit) return explicit;
    return route.fullPath.split("?")[0];
  });

  const canonicalUrl = computed(() => toAbsolute(canonicalPath.value));

  const isHome = computed(() => canonicalPath.value === "/" || route.path === "/");

  const pageTitle = computed(() => {
    const title = read(options.title);
    if (isHome.value || !title) return DEFAULT_TITLE;
    return `${title} | NutriZaria`;
  });

  const pageDescription = computed(() => read(options.description, "") ?? "");
  const ogImage = computed(() => resolveSeoImage(read(options.image, null)));
  const type = computed(() => read(options.type, "website") ?? "website");
  const noindex = computed(() => Boolean(read(options.noindex, false)));

  useSeoMeta({
    title: () => pageTitle.value,
    description: () => pageDescription.value,
    robots: () => (noindex.value ? "noindex, nofollow" : "index, follow"),
    ogTitle: () => pageTitle.value,
    ogDescription: () => pageDescription.value,
    ogType: () => type.value,
    ogUrl: () => canonicalUrl.value,
    ogImage: () => ogImage.value,
    ogSiteName: "NutriZaria",
    ogLocale: "en_US",
    twitterCard: "summary_large_image",
    twitterTitle: () => pageTitle.value,
    twitterDescription: () => pageDescription.value,
    twitterImage: () => ogImage.value,
  });

  useHead(() => ({
    link: [{ rel: "canonical", href: canonicalUrl.value }],
    script: asArray(read(options.jsonld, null)).map((data) => ({
      type: "application/ld+json",
      children: JSON.stringify(data),
    })),
  }));

  return { canonicalUrl, base, toAbsolute, toResolved, pageTitle };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
  base?: string
) {
  const root = base ?? "https://nutrizaria.com";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.includes("://")
        ? item.url
        : `${root}${item.url.startsWith("/") ? item.url : `/${item.url}`}`,
    })),
  };
}
