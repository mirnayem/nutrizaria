<template>
  <div class="space-y-10">
    <header class="rounded-3xl bg-white p-6 shadow-sm">
      <h1 class="text-2xl font-semibold text-slate-900">Blog Management</h1>
      <p class="text-sm text-slate-500">
        Create, edit, and curate NutriZaria blog posts without needing a backend. Posts are
        persisted in localStorage so you can experiment safely before syncing with a real CMS.
      </p>
    </header>

    <section class="rounded-3xl bg-white p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-slate-900">
          {{ isEditing ? "Update post" : "Add new post" }}
        </h2>
        <button
          v-if="isEditing"
          class="text-sm font-semibold text-violet-700"
          @click="resetForm"
        >
          Cancel edit
        </button>
      </div>
      <form class="mt-6 grid gap-4 md:grid-cols-2" @submit.prevent="handleSubmit">
        <label class="text-sm font-medium text-slate-700">
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
            <option v-for="category in defaultCategories" :key="category">
              {{ category }}
            </option>
          </datalist>
        </label>
        <label class="text-sm font-medium text-slate-700">
          Writer
          <input
            v-model="form.writer"
            type="text"
            class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            required
          />
        </label>
        <label class="text-sm font-medium text-slate-700">
          Date
          <input
            v-model="form.date"
            type="date"
            class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            required
          />
        </label>
        <label class="text-sm font-medium text-slate-700 md:col-span-2">
          Cover image URL
          <input
            v-model="form.image"
            type="text"
            placeholder="/images/blogs/organic-food.avif"
            class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            required
          />
        </label>
        <label class="text-sm font-medium text-slate-700 md:col-span-2">
          Content
          <textarea
            v-model="form.content"
            rows="4"
            class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            required
          />
        </label>
        <div class="md:col-span-2 flex gap-3">
          <button
            type="submit"
            class="rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-violet-500"
          >
            {{ isEditing ? "Update post" : "Add post" }}
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
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-slate-900">All posts</h2>
        <p class="text-sm text-slate-500">
          {{ posts.length }} post{{ posts.length === 1 ? "" : "s" }}
        </p>
      </div>
      <div class="mt-4 overflow-x-auto rounded-2xl border border-slate-100">
        <table class="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead class="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th class="px-4 py-3">Title</th>
              <th class="px-4 py-3">Category</th>
              <th class="px-4 py-3">Author</th>
              <th class="px-4 py-3">Date</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="post in posts" :key="post.id" class="text-slate-700">
              <td class="px-4 py-3 font-medium">{{ post.title }}</td>
              <td class="px-4 py-3">{{ post.category }}</td>
              <td class="px-4 py-3">{{ post.writer }}</td>
              <td class="px-4 py-3">{{ useDateFormatter(post.date) }}</td>
              <td class="px-4 py-3 text-right">
                <button
                  class="mr-3 text-sm font-semibold text-violet-700 hover:text-violet-500"
                  @click="startEdit(post)"
                >
                  Edit
                </button>
                <button
                  class="text-sm font-semibold text-rose-600 hover:text-rose-400"
                  @click="removePost(post.id)"
                >
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="posts.length === 0">
              <td colspan="5" class="px-4 py-6 text-center text-slate-500">
                No posts yet. Use the form above to add your first article.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import { useBlogStore } from "~/stores/blog";
import { useDateFormatter } from "~/composables/dateFormater";

const blogStore = useBlogStore();
blogStore.hydrate();
const { posts } = storeToRefs(blogStore);

const editingId = ref<number | null>(null);
const form = reactive({
  title: "",
  category: "",
  writer: "",
  date: "",
  image: "",
  content: "",
});

const defaultCategories = [
  "Organic",
  "Produce",
  "Recipes",
  "Sustainability",
  "E-Commerce",
  "Wellness",
];

const isEditing = computed(() => editingId.value !== null);

const resetForm = () => {
  form.title = "";
  form.category = "";
  form.writer = "";
  form.date = "";
  form.image = "";
  form.content = "";
  editingId.value = null;
};

const startEdit = (post: any) => {
  editingId.value = post.id;
  form.title = post.title;
  form.category = post.category;
  form.writer = post.writer;
  form.date = post.date;
  form.image = post.image;
  form.content = post.content;
};

const handleSubmit = () => {
  if (isEditing.value && editingId.value !== null) {
    blogStore.updatePost(editingId.value, { ...form });
  } else {
    blogStore.addPost({ ...form });
  }
  resetForm();
};

const removePost = (id: number) => {
  if (confirm("Delete this post?")) {
    blogStore.deletePost(id);
  }
};
</script>
