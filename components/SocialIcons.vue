<template>
    <div :class="`social-icons ${direction}`">
        <div class="icon-single h-10 w-10 cursor-pointer rounded-full hover:bg-orange-100 flex items-center justify-center" v-for="icon in icons" :key="icon.id">
            <img class="h-4 w-4" :src="`/images/${icon.image}`" :alt="icon.name">
        </div>
    </div>
</template>

<script setup lang="ts">
  interface Props {
    direction: string;
  }
  const props = defineProps<Props>()
  const icons = [
    {
        id: 1,
        name: 'facebook',
        image: 'facebook.png'
    },
    {
        id: 2,
        name: 'instagram',
        image: 'instagram.png'
    },
    {
        id:3,
        name: 'linkedin',
        image: 'linkedin.png'
    },
    {
        id: 4,
        name: 'youtube',
        image: 'youtube.png'
    },
    {
        id:5,
        name:'twitter',
        image:'twitter.png'
    }
  ]
</script>