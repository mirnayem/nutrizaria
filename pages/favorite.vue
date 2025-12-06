<template>
  <div class="favorite-list">
    <div class="no-items text-center text-sm text-slate-500" v-if="!items.length">
      No Items Found at Favorite Lists
    </div>
    <div class="items" v-else>
      <Products :products="items" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useFavoriteStore } from "~/stores/favorite";

const favorite = useFavoriteStore();
const { items } = storeToRefs(favorite);
</script>
