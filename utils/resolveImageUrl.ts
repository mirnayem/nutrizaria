export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '/placeholder.svg';
  const s = String(url).trim();
  if (!s) return '/placeholder.svg';
  if (/^https?:\/\/localhost:\d+\//.test(s)) {
    try {
      return new URL(s).pathname;
    } catch {
      return s;
    }
  }
  if (s.includes('://')) return s;
  if (s.startsWith('/uploads/') || s.startsWith('/images/')) return s;
  if (s.startsWith('/')) return s;
  return `/images/${s}`;
}
