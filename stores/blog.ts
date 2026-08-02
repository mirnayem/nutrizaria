import { defineStore } from "pinia";
import { defaultBlogPosts } from "~/data/blogs";
import { blogSlugFromTitle, cleanBackendSlug, uniqueSlug } from "~/utils/slugify";
import type { Post } from "~/types/product";

const mapUrl = (url: string) => {
  const value = String(url || "").trim();
  return /^https?:\/\/localhost:\d+\//.test(value) ? new URL(value).pathname : value;
};

const normalizeApiPost = (post: any, slugTaken: Set<string>): Post => {
  const base = blogSlugFromTitle(post.title) || cleanBackendSlug(post.slug || "") || String(post.id);
  return {
    id: String(post.id),
    title: post.title,
    category: post.category ?? "General",
    writer: post.author ?? "NutriZaria Team",
    date: post.publishedAt ?? post.createdAt ?? new Date().toISOString(),
    image: post.image ? mapUrl(post.image) : post.image,
    content: post.content ?? "",
    slug: uniqueSlug(base, slugTaken),
    rawSlug: post.slug || undefined,
    excerpt: post.excerpt || undefined,
    views: post.views ?? 0,
  };
};

const toPostList = (res: any): any[] => {
  const payload = res?.data ?? res;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

interface BlogState {
  posts: Post[];
  selectedBlog: Post | null;
  hydrated: boolean;
  loading: boolean;
  hydratePromise: Promise<void> | null;
  useApi: boolean;
}

const isClient = typeof window !== "undefined";
const STORAGE_KEY = "nutrizaria.blog.posts.v2";

export const useBlogStore = defineStore("blog", {
  state: (): BlogState => ({
    posts: [],
    selectedBlog: null,
    hydrated: false,
    loading: false,
    hydratePromise: null,
    useApi: false,
  }),
  getters: {
    postBySlug: (state) => (slug: string) =>
      state.posts.find((post) => post.slug === slug) ||
      state.posts.find((post) => post.rawSlug === slug) ||
      state.posts.find((post) => String(post.id) === slug) ||
      state.posts.find((post) => blogSlugFromTitle(post.title) === slug),
  },
  actions: {
    async hydrate() {
      if (this.hydrated) return;
      if (this.hydratePromise) return this.hydratePromise;

      const slugTaken = new Set<string>();
      this.loading = true;
      this.hydratePromise = (async () => {
        try {
          const config = useRuntimeConfig();
          const apiBase = config.public.apiBase;
          if (apiBase) {
            const res = await $fetch(`${apiBase}/blogs`);
            const items = toPostList(res);
            if (Array.isArray(items) && items.length) {
              this.posts = items.map((item: any) => normalizeApiPost(item, slugTaken));
              this.useApi = true;
            }
          }
        } catch (error) {
          console.warn("[blog] API unavailable, using seed posts");
          const cached = this.readCached();
          this.posts = cached?.length ? cached : defaultBlogPosts.map((p) => ({ ...p }));
        } finally {
          if (!this.posts.length) {
            this.posts = defaultBlogPosts.map((p) => ({ ...p }));
          }
          this.persist();
          this.loading = false;
          this.hydrated = true;
          this.hydratePromise = null;
        }
      })();

      return this.hydratePromise;
    },

    readCached(): Post[] {
      if (!isClient) return [];
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      try {
        return JSON.parse(raw);
      } catch (error) {
        return [];
      }
    },

    persist() {
      if (!isClient) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.posts));
    },

    setSelectedBlog(post: Post) {
      this.selectedBlog = post;
    },

    addPost(payload: Omit<Post, "id" | "slug">) {
      const slugTaken = new Set(this.posts.map((post) => post.slug).filter(Boolean) as string[]);
      const newPost: Post = {
        ...payload,
        id: String(Date.now()),
        slug: uniqueSlug(blogSlugFromTitle(payload.title), slugTaken),
      };
      this.posts = [newPost, ...this.posts];
      this.persist();
      return newPost;
    },

    updatePost(postId: string, payload: Partial<Post>) {
      this.posts = this.posts.map((post) => {
        if (String(post.id) !== String(postId)) return post;
        const slugTaken = new Set(this.posts.map((p) => p.slug).filter(Boolean) as string[]);
        return {
          ...post,
          ...payload,
          slug: payload.title ? uniqueSlug(blogSlugFromTitle(payload.title), slugTaken) : post.slug,
        };
      });
      this.persist();
    },

    deletePost(postId: string) {
      this.posts = this.posts.filter((post) => String(post.id) !== String(postId));
      this.persist();
    },
  },
});