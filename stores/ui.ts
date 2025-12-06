import { defineStore } from "pinia";

interface UIState {
  isSidebarOpen: boolean;
}

export const useUIStore = defineStore("ui", {
  state: (): UIState => ({
    isSidebarOpen: false,
  }),
  actions: {
    toggleSidebar(forceState?: boolean) {
      if (typeof forceState === "boolean") {
        this.isSidebarOpen = forceState;
        return;
      }
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    closeSidebar() {
      this.isSidebarOpen = false;
    },
  },
});
