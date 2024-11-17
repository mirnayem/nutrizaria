import { ref, onMounted, onUnmounted } from "vue";

export function useWindowResize() {
  const width = ref<number>(0);
  const height = ref<number>(0);

  const handleResize = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  };

  onMounted(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
  });

  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
  });

  return {
    width,
    height,
  };
}
