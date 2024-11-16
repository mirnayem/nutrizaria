export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide("slugify", function (str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  });
});
