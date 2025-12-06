import { defineStore } from "pinia";
import { defaultBlogPosts } from "~/data/blogs";
import type { Post } from "~/types/product";

const STORAGE_KEY = "nutrizaria.blog.posts";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

interface BlogState {
  posts: Post[];
  selectedBlog: Post | null;
  hydrated: boolean;
  nextId: number;
}

const seedPosts = (): Post[] => defaultBlogPosts.map((post) => ({ ...post }));

const loadFromStorage = (): BlogState | null => {
  if (typeof window === "undefined") return null;
  const payload = localStorage.getItem(STORAGE_KEY);
  if (!payload) return null;
  try {
    const parsed = JSON.parse(payload);
    return {
      posts: parsed.posts ?? seedPosts(),
      selectedBlog: parsed.selectedBlog ?? null,
      hydrated: true,
      nextId:
        typeof parsed.nextId === "number"
          ? parsed.nextId
          : (parsed.posts?.length || defaultBlogPosts.length) + 1,
    };
  } catch (error) {
    console.error("[blog] failed to parse storage", error);
    return null;
  }
};

const persistToStorage = (state: BlogState) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      posts: state.posts,
      selectedBlog: state.selectedBlog,
      nextId: state.nextId,
    })
  );
};

export const useBlogStore = defineStore("blog", {
  state: (): BlogState => ({
    posts: seedPosts(),
    selectedBlog: null,
    hydrated: false,
    nextId: defaultBlogPosts.length + 1,
  }),
  getters: {
    postBySlug: (state) => (slug: string) =>
      state.posts.find((post) => post.slug === slug),
  },
  actions: {
    hydrate() {
      if (this.hydrated) return;
      const fromStorage = loadFromStorage();
      if (fromStorage) {
        this.posts = fromStorage.posts;
        this.selectedBlog = fromStorage.selectedBlog;
        this.nextId = fromStorage.nextId;
      }
      this.hydrated = true;
    },
    persist() {
      persistToStorage(this.$state);
    },
    setSelectedBlog(post: Post) {
      this.selectedBlog = post;
      this.persist();
    },
    addPost(payload: Omit<Post, "id" | "slug">) {
      const slug = slugify(payload.title);
      const newPost: Post = {
        ...payload,
        id: this.nextId++,
        slug,
      };
      this.posts = [newPost, ...this.posts];
      this.persist();
      return newPost;
    },
    updatePost(postId: number, payload: Partial<Post>) {
      this.posts = this.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              ...payload,
              slug: payload.title ? slugify(payload.title) : post.slug,
            }
          : post
      );
      this.persist();
    },
    deletePost(postId: number) {
      this.posts = this.posts.filter((post) => post.id !== postId);
      this.persist();
    },
  },
});
