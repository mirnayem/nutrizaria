export function slugify(value: string): string {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function blogSlugFromTitle(title: string): string {
  return slugify(title);
}

export function cleanBackendSlug(slug: string): string {
  const value = String(slug || "").trim();
  if (!value) return "";
  const cleaned = value.replace(/-[a-z0-9]{6,}$/, "").replace(/^-+|-+$/g, "");
  return cleaned;
}

export function uniqueSlug(base: string, taken: Set<string>): string {
  let candidate = base || "post";
  if (!/[\w-]/.test(candidate)) candidate = "post";
  let index = 1;
  while (taken.has(candidate)) {
    candidate = `${base || "post"}-${index}`;
    index += 1;
  }
  taken.add(candidate);
  return candidate;
}
