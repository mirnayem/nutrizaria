import { ref, onMounted, onUnmounted, computed } from "vue";

export const useResponsiveItems = () => {
  const windowWidth = ref(0);

  const updateWindowWidth = () => {
    if(typeof window !== 'undefined') {
        windowWidth.value = window.innerWidth;
    }
  };

  onMounted(() => {
    updateWindowWidth();
    window.addEventListener("resize", updateWindowWidth);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", updateWindowWidth);
  });

  const computedItems = computed(() => {
    if (windowWidth.value >= 1280) {
        return 4;
      }
      else if (windowWidth.value >=1024){
          return 3;
      }
       else if (windowWidth.value >= 768) {
        return 2;
      } else {
        return 1;
      }
  });

  return {
    computedItems,
  };
};
