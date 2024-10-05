<script setup lang="ts">
import { ref } from "vue";

const isModalOpen = ref(false);

const openModal = () => {
  isModalOpen.value = true;
};

interface Product {
  id: number;
  name: string;
  image: string;
  description: string;
  benefits: string[];
  price: number;
  quantity: string;
}

interface Props {
  product: Product;
}
const props = defineProps<Props>();
const img = useImage();
</script>
<template>
  <div class="product__single grid gap-1 relative group">
    <div class="image transition-all duration-700 ease-in-out w-fit mx-auto">
      <NuxtImg
        :src="`/images/${product.image}`"
        :alt="product.name"
        width="350"
        height="350"
        loading="lazy"
        :placeholder="img(`/nutri.png`, { h: 300, f: 'png', blur: 1, q: 50 })"
        sizes="100vw sm:50vw md:400px"
        class="rounded-md sm:w-72 sm:h-72 w-80 h-80 object-cover"
      />
    </div>
    <div
      class="favorite-info-cart transition-all duration-700 ease-in-out transform -translate-y-10 group-hover:translate-y-[-70px] text-white opacity-0 flex group-hover:opacity-100 gap-5 items-center justify-center"
    >
      <div
        class="favorite w-10 h-10 cursor-pointer rounded-full bg-orange-500 flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
          />
        </svg>
      </div>
      <div
        class="info w-10 h-10 cursor-pointer rounded-full bg-orange-500 flex items-center justify-center"
        @click="openModal"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
          />
        </svg>
      </div>
      <div
        class="cart w-10 h-10 cursor-pointer rounded-full bg-orange-500 flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          />
        </svg>
      </div>
    </div>
    <div class="name text-center font-light -mt-10">{{ product.name }}</div>
    <div class="price text-center font-bold -mt-5">
      {{ "$" + product.price }}
    </div>
    <AppModal
      :isOpen="isModalOpen"
      @handleModal="isModalOpen = $event"
      :title="product.name"
    >
      <div class="image-details grid grid-cols-12 gap-6">
        <div class="image col-span-6">
          <NuxtImg
            :src="`/images/${product.image}`"
            :alt="product.name"
            width="350"
            height="350"
            loading="lazy"
            :placeholder="
              img(`/nutri.png`, { h: 300, f: 'png', blur: 1, q: 50 })
            "
            sizes="100vw sm:50vw md:400px"
            class="rounded-md sm:w-72 sm:h-72 w-80 h-80 object-cover"
          />
        </div>
        <div class="details col-span-6 flex flex-col gap-4">
          <div class="price col-span-12">Price: {{ product.price }} bdt</div>
          <div class="quantity col-span-12">
            Quantity:{{ product.quantity }}
          </div>
          <div class="description col-span-12">
            Description: {{ product.description }}
          </div>
          <QuanityControl />
        </div>
      </div>
      <div class="benefits my-5">
        <p class="py-2">Benefits of {{ product.name }}</p>
        <div
          class="benefit-single pb-2"
          v-for="(benefit, index) in product.benefits"
          :key="index"
        >
          <p>{{ index+1 +'.'+ benefit }}</p>
        </div>
      </div>
    </AppModal>
  </div>
</template>
