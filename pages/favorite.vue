<template>
  <div class="favorite-list" >
    <div class="no-items" v-if="items.length === 0">
        No Items Found at Favorite Lists
    </div>
    <div class="items" v-else>
        <Products :products="items"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useFavoriteStore } from '~/stores/favorite';
const favorite = useFavoriteStore()
const {items} = favorite
</script>
