import { onMounted, onUnmounted, type Ref } from "vue";

export function useClickOutside(
  elementRef: Ref<HTMLElement | null>,
  onClickOutside: () => void
) {
  const handleClickOutside = (event: MouseEvent) => {
    if (elementRef.value && !elementRef.value.contains(event.target as Node)) {
      onClickOutside();
    }
  };

  onMounted(() => {
    document.addEventListener("mousedown", handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener("mousedown", handleClickOutside);
  });
}
