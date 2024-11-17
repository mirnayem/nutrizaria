// Store setup
import { defineStore } from "pinia";
import type { Post } from "~/types/product";

export const useBlogStore = defineStore("blog", {
  state: () => ({
    selectedBlog: {} as Post,
  }),
  actions: {
    setSelectedBlog(data: Post) {
      this.selectedBlog = data;
      localStorage.setItem('selectedBlog', JSON.stringify(data));
    },
  },
});
