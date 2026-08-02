import { readonly, ref } from "vue";

type DeliveryConfig = {
  insideDhakaFee: number;
  outsideDhakaFee: number;
  freeDeliveryThreshold: number;
  currency: string;
  currencySymbol: string;
};

const cache = ref<DeliveryConfig | null>(null);

export const useDeliveryConfig = () => {
  const config = useRuntimeConfig();
  const loading = ref(false);

const fetchConfig = async (): Promise<DeliveryConfig> => {
    if (cache.value) return cache.value;
    loading.value = true;
    try {
      const base = config.public.apiBase || "http://localhost:4000/api";
      const res = await $fetch<DeliveryConfig>(`${base}/delivery`);
      cache.value = (res as any)?.data ?? res;
      return cache.value;
    } catch {
      cache.value = {
        insideDhakaFee: 80,
        outsideDhakaFee: 150,
        freeDeliveryThreshold: 2000,
        currency: "bdt",
        currencySymbol: "Tk",
      };
      return cache.value;
    } finally {
      loading.value = false;
    }
  };

  return { config: readonly(cache), loading, fetchConfig };
};