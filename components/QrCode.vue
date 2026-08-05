<template>
  <img v-if="src" :src="src" :width="size" :height="size" :alt="alt" class="block" />
  <div v-else :style="{ width: size + 'px', height: size + 'px' }" class="flex items-center justify-center rounded bg-slate-100 text-[10px] text-slate-400">
    QR
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import QRCode from "qrcode";

const props = withDefaults(
  defineProps<{
    value: string;
    size?: number;
    ecLevel?: "L" | "M" | "Q" | "H";
    margin?: number;
    alt?: string;
  }>(),
  {
    size: 96,
    ecLevel: "M",
    margin: 1,
    alt: "QR code",
  }
);

const src = ref<string>("");

const generate = async () => {
  if (!props.value) {
    src.value = "";
    return;
  }
  try {
    src.value = await QRCode.toDataURL(props.value, {
      width: props.size,
      margin: props.margin,
      errorCorrectionLevel: props.ecLevel,
      color: { dark: "#0f172a", light: "#ffffff" },
    });
  } catch (e) {
    console.error("QR generation failed", e);
    src.value = "";
  }
};

watch(() => props.value, generate, { immediate: true });
</script>