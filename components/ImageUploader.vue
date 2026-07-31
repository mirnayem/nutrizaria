<template>
  <div class="space-y-3">
    <div
      class="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition"
      :class="isDragging ? 'border-violet-500 bg-violet-50' : 'border-slate-300 hover:border-violet-400 hover:bg-slate-50'"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="inputRef?.click()"
    >
      <svg class="mb-2 h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
      </svg>
      <p class="text-sm text-slate-600">
        <span class="font-medium text-violet-600">Click to upload</span> or drag and drop
      </p>
      <p class="mt-1 text-xs text-slate-400">PNG, JPG, WebP, AVIF up to 5MB</p>
      <input ref="inputRef" type="file" :accept="accept" :multiple="multiple" class="hidden" @change="handleFiles" />
    </div>

    <div v-if="items.length > 0" class="flex flex-wrap gap-3">
      <div
        v-for="(item, idx) in items"
        :key="item.key"
        class="group relative h-24 w-24 overflow-hidden rounded-lg border bg-slate-50"
        :class="item.status === 'error' ? 'border-red-300' : 'border-slate-200'"
      >
        <img
          :src="item.displayUrl"
          class="h-full w-full cursor-pointer object-cover transition hover:scale-105"
          @click="previewImg = item.displayUrl"
        />

        <div v-if="item.status === 'uploading'" class="absolute inset-0 flex items-center justify-center bg-black/30">
          <svg class="h-6 w-6 animate-spin text-white" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>

        <div v-if="item.status === 'error'" class="absolute inset-0 flex items-center justify-center bg-red-500/20">
          <svg class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>

        <button
          @click="removeImage(idx)"
          class="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow transition hover:bg-red-600 group-hover:opacity-100"
        >
          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <div v-if="item.status === 'error'" class="absolute bottom-0 left-0 right-0 bg-red-500 px-1 py-0.5 text-center text-[10px] text-white">
          Failed
        </div>
      </div>
    </div>

    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="previewImg"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          @click="previewImg = null"
        >
          <button
            @click="previewImg = null"
            class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            :src="previewImg"
            class="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            @click.stop
          />
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

interface ImageItem {
  key: number;
  displayUrl: string;
  remoteUrl: string;
  status: 'local' | 'uploading' | 'remote' | 'error';
}

const props = withDefaults(defineProps<{
  multiple?: boolean;
  accept?: string;
  images?: string[];
}>(), {
  multiple: false,
  accept: 'image/png,image/jpeg,image/webp,image/avif',
  images: () => [],
});

const emit = defineEmits<{ 'update:images': [value: string[]] }>();

let keyCounter = 0;
const inputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const previewImg = ref<string | null>(null);
const items = ref<ImageItem[]>([]);
const runtimeConfig = useRuntimeConfig();
const uploadApiBase = runtimeConfig.public.apiBase;
const authToken = useCookie('auth_token');

const { resolve } = useImageUrl();
const resolveUrl = (url: string) => resolve(url);

const serverUrls = computed(() =>
  items.value.filter(i => i.status === 'remote').map(i => i.remoteUrl)
);

watch(() => props.images, (val) => {
  const incoming = val || [];
  const isSame = incoming.length === serverUrls.value.length &&
    incoming.every((u, i) => u === serverUrls.value[i]);
  if (isSame) return;
  items.value = incoming.map(url => ({
    key: keyCounter++,
    displayUrl: resolveUrl(url),
    remoteUrl: url,
    status: 'remote' as const,
  }));
}, { deep: true, immediate: true });

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  if (e.dataTransfer?.files) processFiles(Array.from(e.dataTransfer.files));
};

const handleFiles = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    processFiles(Array.from(target.files));
    target.value = '';
  }
};

const processFiles = async (files: File[]) => {
  for (const file of files) {
    if (!file.type.match(/\/(jpg|jpeg|png|gif|webp|avif)$/)) continue;

    const objectUrl = URL.createObjectURL(file);
    const idx = items.value.length;

    items.value.push({
      key: keyCounter++,
      displayUrl: objectUrl,
      remoteUrl: '',
      status: 'uploading',
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await $fetch(`${uploadApiBase}/admin/uploads/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken.value}` },
        body: formData,
      });

      const remoteUrl = res?.data?.url || res?.url || '';
      if (remoteUrl) {
        items.value[idx] = {
          ...items.value[idx],
          displayUrl: resolve(remoteUrl),
          remoteUrl,
          status: 'remote',
        };
        URL.revokeObjectURL(objectUrl);
      } else {
        items.value[idx] = { ...items.value[idx], status: 'error' };
      }
    } catch {
      items.value[idx] = { ...items.value[idx], status: 'error' };
    }

    emit('update:images', [...serverUrls.value]);
  }
};

const removeImage = (idx: number) => {
  const item = items.value[idx];
  if (item.displayUrl.startsWith('blob:')) URL.revokeObjectURL(item.displayUrl);
  items.value.splice(idx, 1);
  emit('update:images', [...serverUrls.value]);
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
