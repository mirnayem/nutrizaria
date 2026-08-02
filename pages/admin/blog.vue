<template>
  <div class="space-y-10">
    <header class="rounded-3xl bg-white p-6 shadow-sm">
      <h1 class="text-2xl font-semibold text-slate-900">Blog Management</h1>
      <p class="text-sm text-slate-500">
        Create, edit, and curate NutriZaria blog posts. Posts are saved to the database.
      </p>
    </header>

    <div v-if="notice" class="rounded-2xl px-4 py-3 text-sm" :class="notice.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'">
      {{ notice.message }}
    </div>

    <section class="rounded-3xl bg-white p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-slate-900">
          {{ isEditing ? "Update post" : "Add new post" }}
        </h2>
        <button v-if="isEditing" class="text-sm font-semibold text-violet-700" @click="resetForm">
          Cancel edit
        </button>
      </div>
      <form class="mt-6 grid gap-4 md:grid-cols-2" @submit.prevent="handleSubmit">
        <label class="text-sm font-medium text-slate-700 md:col-span-2">
          Title
          <input
            v-model="form.title"
            type="text"
            class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            required
          />
        </label>
        <label class="text-sm font-medium text-slate-700">
          Category
          <input
            v-model="form.category"
            type="text"
            list="blog-category-options"
            class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            required
          />
          <datalist id="blog-category-options">
            <option v-for="category in categoryOptions" :key="category">
              {{ category }}
            </option>
          </datalist>
        </label>
        <label class="text-sm font-medium text-slate-700">
          Author
          <input
            v-model="form.author"
            type="text"
            class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            required
          />
        </label>
        <label class="text-sm font-medium text-slate-700 md:col-span-2">
          Cover image
          <ImageUploader
            class="mt-2"
            :images="form.image ? [form.image] : []"
            @update:images="onCoverImageUpload"
          />
          <p v-if="form.image" class="mt-2 text-xs text-slate-400">
            Uploaded: {{ form.image }}
          </p>
        </label>
        <label class="text-sm font-medium text-slate-700 md:col-span-2">
          Excerpt
          <textarea
            v-model="form.excerpt"
            rows="2"
            class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            placeholder="Short summary shown on cards and in search results"
          />
        </label>
        <label class="text-sm font-medium text-slate-700 md:col-span-2">
          Content
          <textarea
            v-model="form.content"
            rows="8"
            class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            required
          />
        </label>
        <label class="flex items-center gap-2 text-sm font-medium text-slate-700 md:col-span-2">
          <input
            v-model="form.isPublished"
            type="checkbox"
            class="rounded border-slate-300 text-violet-600 focus:ring-violet-200"
          />
          Publish this post
        </label>
        <div class="md:col-span-2 flex gap-3">
          <button
            type="submit"
            class="rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-violet-500"
            :disabled="saving"
          >
            {{ saving ? 'Saving...' : (isEditing ? "Update post" : "Add post") }}
          </button>
          <button
            type="button"
            class="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-600 transition hover:border-violet-300 hover:text-violet-600"
            @click="resetForm"
          >
            Reset
          </button>
        </div>
      </form>
    </section>

    <section class="rounded-3xl bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-xl font-semibold text-slate-900">All posts</h2>
          <p class="text-sm text-slate-500">
            {{ totalPosts }} post{{ totalPosts === 1 ? "" : "s" }}
          </p>
        </div>
        <label class="flex w-full items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-500 lg:w-72">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="size-4" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z" />
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search posts..."
            class="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
          />
        </label>
      </div>
      <div class="mt-4 overflow-x-auto rounded-2xl border border-slate-100">
        <table class="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead class="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th class="px-4 py-3">Image</th>
              <th class="px-4 py-3">Title</th>
              <th class="px-4 py-3">Category</th>
              <th class="px-4 py-3">Author</th>
              <th class="px-4 py-3">Date</th>
              <th class="px-4 py-3">Views</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="post in filteredPosts" :key="post.id" class="text-slate-700">
              <td class="px-4 py-3">
                <img
                  v-if="post.image"
                  :src="resolve(post.image)"
                  :alt="post.title"
                  class="h-10 w-10 rounded-lg object-cover"
                />
                <span v-else class="text-slate-300">—</span>
              </td>
              <td class="max-w-64 truncate px-4 py-3 font-medium" :title="post.title">
                {{ post.title }}
              </td>
              <td class="px-4 py-3">{{ post.category }}</td>
              <td class="px-4 py-3">{{ post.author }}</td>
              <td class="px-4 py-3">{{ useDateFormatter(post.publishedAt || post.createdAt) }}</td>
              <td class="px-4 py-3">{{ post.views ?? 0 }}</td>
              <td class="px-4 py-3">
                <button
                  type="button"
                  class="rounded-full px-2 py-0.5 text-xs font-medium transition"
                  :class="post.isPublished ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                  :title="post.isPublished ? 'Click to unpublish' : 'Click to publish'"
                  @click="togglePublish(post)"
                >
                  {{ post.isPublished ? "Published" : "Draft" }}
                </button>
              </td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <NuxtLink
                  v-if="post.slug"
                  :to="`/blog/${post.slug}`"
                  target="_blank"
                  class="mr-3 text-sm font-semibold text-slate-500 hover:text-slate-700"
                >
                  View
                </NuxtLink>
                <button
                  class="mr-3 text-sm font-semibold text-violet-700 hover:text-violet-500"
                  @click="startEdit(post)"
                >
                  Edit
                </button>
                <button
                  class="text-sm font-semibold text-rose-600 hover:text-rose-400"
                  @click="askDelete(post)"
                >
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="loadingPosts">
              <td colspan="8" class="px-4 py-6 text-center text-slate-400">Loading posts...</td>
            </tr>
            <tr v-else-if="filteredPosts.length === 0">
              <td colspan="8" class="px-4 py-6 text-center text-slate-500">
                {{ searchQuery ? "No posts match your search." : "No posts yet. Use the form above to add your first article." }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="totalPages > 1" class="mt-4 flex items-center justify-between">
        <p class="text-sm text-slate-500">
          Page {{ currentPage }} of {{ totalPages }}
        </p>
        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-700 disabled:opacity-40"
            :disabled="currentPage <= 1"
            @click="changePage(currentPage - 1)"
          >
            Previous
          </button>
          <button
            type="button"
            class="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-700 disabled:opacity-40"
            :disabled="currentPage >= totalPages"
            @click="changePage(currentPage + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </section>

    <AppConfirmModal
      :isOpen="confirmModal.isOpen"
      :title="confirmModal.title"
      :message="confirmModal.message"
      confirmText="Delete"
      variant="danger"
      @confirm="executeConfirm"
      @cancel="confirmModal.isOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useAdminApi } from "~/composables/useAdminApi";
import { useDateFormatter } from "~/composables/dateFormater";
import { blogSlugFromTitle } from "~/utils/slugify";
import ImageUploader from "~/components/ImageUploader.vue";
import AppConfirmModal from "~/components/AppConfirmModal.vue";

definePageMeta({ layout: 'admin' });

const adminApi = useAdminApi();
const { resolve } = useImageUrl();

const posts = ref<any[]>([]);
const loadingPosts = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);
const searchQuery = ref("");
const currentPage = ref(1);
const totalPosts = ref(0);
const totalPages = ref(1);

const notice = ref<{ type: 'error' | 'success'; message: string } | null>(null);

const form = reactive({
  title: "",
  category: "",
  author: "",
  excerpt: "",
  image: "",
  content: "",
  isPublished: true,
});

const defaultCategories = ["Organic", "Produce", "Recipes", "Sustainability", "E-Commerce", "Wellness"];

const categoryOptions = computed(() => {
  const existing = Array.from(new Set(posts.value.map((post) => post.category).filter(Boolean)));
  return ["All", ...new Set([...defaultCategories, ...existing])].filter((c) => c !== "All");
});

const isEditing = computed(() => editingId.value !== null);

const filteredPosts = computed(() => {
  if (!searchQuery.value) return posts.value;
  const query = searchQuery.value.toLowerCase();
  return posts.value.filter(
    (post) =>
      post.title.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query) ||
      post.author.toLowerCase().includes(query)
  );
});

const resetForm = () => {
  form.title = "";
  form.category = "";
  form.author = "";
  form.excerpt = "";
  form.image = "";
  form.content = "";
  form.isPublished = true;
  editingId.value = null;
};

const onCoverImageUpload = (urls: string[]) => {
  form.image = urls[0] || "";
};

const startEdit = (post: any) => {
  editingId.value = post.id;
  form.title = post.title;
  form.category = post.category;
  form.author = post.author;
  form.excerpt = post.excerpt || "";
  form.image = post.image || "";
  form.content = post.content;
  form.isPublished = !!post.isPublished;
  notice.value = null;
};

const loadPosts = async () => {
  loadingPosts.value = true;
  notice.value = null;
  try {
    const res = await adminApi.getBlogs({ page: currentPage.value, limit: 20 });
    const payload = res?.data ?? res;
    posts.value = payload?.items ?? payload ?? [];
    totalPosts.value = payload?.meta?.total ?? posts.value.length;
    totalPages.value = payload?.meta?.totalPages ?? 1;
  } catch (e) {
    console.error("Failed to load posts", e);
    notice.value = { type: 'error', message: "Could not load posts." };
  } finally {
    loadingPosts.value = false;
  }
};

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

watch(currentPage, loadPosts);

const handleSubmit = async () => {
  saving.value = true;
  notice.value = null;
  try {
    const payload = {
      title: form.title.trim(),
      category: form.category.trim(),
      author: form.author.trim(),
      excerpt: form.excerpt.trim() || undefined,
      image: form.image.trim() || undefined,
      content: form.content,
      isPublished: form.isPublished,
    };
    if (isEditing.value && editingId.value !== null) {
      await adminApi.updateBlog(editingId.value, payload);
      notice.value = { type: 'success', message: "Post updated successfully." };
    } else {
      await adminApi.createBlog(payload);
      notice.value = { type: 'success', message: "Post created successfully." };
    }
    resetForm();
    await loadPosts();
  } catch (e: any) {
    console.error("Failed to save post", e);
    notice.value = { type: 'error', message: e?.data?.message || "Failed to save the post. Please try again." };
  } finally {
    saving.value = false;
  }
};

const togglePublish = async (post: any) => {
  try {
    await adminApi.updateBlog(post.id, { isPublished: !post.isPublished });
    post.isPublished = !post.isPublished;
    notice.value = {
      type: 'success',
      message: post.isPublished ? `"${post.title}" published.` : `"${post.title}" moved to drafts.`,
    };
  } catch (e: any) {
    console.error("Failed to toggle publish", e);
    notice.value = { type: 'error', message: e?.data?.message || "Failed to update post." };
  }
};

const confirmModal = reactive({
  isOpen: false,
  title: '',
  message: '',
  post: null as any,
});

const askDelete = (post: any) => {
  confirmModal.post = post;
  confirmModal.title = "Delete post";
  confirmModal.message = `Are you sure you want to delete "${post.title}"? This action cannot be undone.`;
  confirmModal.isOpen = true;
};

const executeConfirm = async () => {
  const post = confirmModal.post;
  confirmModal.isOpen = false;
  if (!post) return;
  try {
    await adminApi.deleteBlog(post.id);
    notice.value = { type: 'success', message: `"${post.title}" deleted.` };
    if (editingId.value === post.id) resetForm();
    if (posts.value.length === 1 && currentPage.value > 1) {
      currentPage.value -= 1;
    } else {
      await loadPosts();
    }
  } catch (e) {
    console.error("Failed to delete post", e);
    notice.value = { type: 'error', message: "Failed to delete the post." };
  }
};

onMounted(loadPosts);
</script>