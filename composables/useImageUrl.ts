export function useImageUrl() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase || "http://localhost:4000/api";
  const backendBase = apiBase.replace(/\/+$/, "").replace(/\/api$/, "");

  function resolve(url: string | null | undefined): string {
    if (!url) return "/placeholder.svg";
    const s = String(url).trim();
    if (!s) return "/placeholder.svg";
    if (/^https?:\/\/localhost:\d+\//.test(s)) {
      try {
        return `${backendBase}${new URL(s).pathname}`;
      } catch {
        return s;
      }
    }
    if (s.startsWith("/uploads/")) return `${backendBase}${s}`;
    if (s.includes("://")) return s;
    if (s.startsWith("/")) return s;
    return `/images/${s}`;
  }

  return { resolve };
}
