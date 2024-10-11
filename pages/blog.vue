<template>
  <div class="blog">
    <header class="max-w-2xl mx-auto">
      <h1 class="text-center text-3xl font-light">Blog</h1>
      <p class="my-2 text-center font-thin">
        valuable insights, tips, and updates related to food trends, healthy
        eating, and cooking tips. It serves as a resource for customers to
        explore new recipes, learn about product benefits, and stay informed
        about seasonal offerings and promotion
      </p>
    </header>
    <div
      class="blog-menus flex overflow-x-auto scrollbar-hide whitespace-nowrap gap-x-3 items-center border-b-2 mt-10"
    >
      <div
        class="menu-single font-thin cursor-pointer flex-shrink-0 relative group pb-1 hover:text-orange-800"
        v-for="item in blogCategories"
        :key="item.id"
      >
        {{ item.category }}
        <div
          class="absolute left-0 -bottom-0.5 h-1 bg-orange-800 w-0 group-hover:w-full transition-all duration-300"
        ></div>
      </div>
    </div>
    <div class="blog-posts flex flex-wrap gap-x-6 gap-y-20 mt-10">
      <div
        class="post-single relative w-full sm:w-[calc(50%-12px)] group transition-opacity duration-500 ease-in-out opacity-0"
        :class="{
          'opacity-100': index < visiblePostsCount,
          'delay-200': transitioning,
        }"
        v-for="(post, index) in blogPosts.slice(0, visiblePostsCount)"
        :key="post.id"
        v-show="index < visiblePostsCount"
      >
        <div class="image relative">
          <img
            class="w-full h-96 object-cover"
            :src="post.image"
            alt="post.title"
          />
          <div
            class="writer-time-category absolute w-full bg-white bg-opacity-30 backdrop-blur-sm text-white left-0 bottom-0 h-24 flex items-center px-5 justify-between"
          >
            <div class="writer-time">
              <div class="writer">{{ post.writer }}</div>
              <div class="date">{{ useDateFormatter(post.date) }}</div>
            </div>
            <div class="category">{{ post.category }}</div>
          </div>
        </div>
        <div
          class="absolute top-0 right-0 w-0 h-0 border-t-[30px] border-t-transparent group-hover:border-t-slate-600 group-hover:border-l-[30px] group-hover:border-l-white transform rotate-180 transition-colors duration-300 ease-in-out"
        ></div>

        <div class="title mt-2 relative inline-block text-lg font-light">
          {{ post.title }}
          <div
            class="absolute left-0 bottom-[-4px] h-[2px] w-0 bg-orange-800 transition-all duration-300 group-hover:w-full"
          ></div>
        </div>
        <div class="content my-2 text-sm font-thin">
          <p v-html="useTruncate(post.content, 25, true)"></p>
        </div>
        <button
          class="read-post flex gap-2 items-center text-sm hover:text-orange-800 transition-all"
        >
          Read Post
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
            />
          </svg>
        </button>
      </div>
    </div>
    <div class="show-more my-10" v-if="blogPosts.length > visiblePostsCount">
      <button
        class="nutri-btn mx-auto hover:bg-orange-600"
        @click="showMorePosts"
      >
        Show More Posts
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useDateFormatter } from "~/composables/dateFormater";
import { useTruncate } from "~/composables/useTruncate";
import { ref, nextTick } from "vue";

interface Post {
  id: number;
  title: string;
  category: string;
  writer: string;
  date: string;
  image: string;
  content: string;
}
const visiblePostsCount = ref(2);
const transitioning = ref(false);

const showMorePosts = () => {
  transitioning.value = true;
  nextTick(() => {
    visiblePostsCount.value += 2;
    transitioning.value = false;
  });
};
const blogCategories = [
  {
    id: 1,
    category: "Healthy Eating",
  },
  {
    id: 2,
    category: "Meal Ideas",
  },
  {
    id: 3,
    category: "Food Trends",
  },
  {
    id: 4,
    category: "Organic Foods",
  },
  {
    id: 5,
    category: "Special Diets",
  },
  {
    id: 6,
    category: "Cooking Tips",
  },
  {
    id: 7,
    category: "Seasonal Products",
  },
  {
    id: 8,
    category: "Product Reviews",
  },
  {
    id: 9,
    category: "Customer Stories",
  },
  {
    id: 10,
    category: "Special Offers",
  },
];

const blogPosts: Post[] = [
  {
    id: 1,
    title: "The Future of Organic Food in E-Commerce",
    category: "Organic",
    writer: "Sarah Thompson",
    date: "2024-10-01",
    image: "/images/blogs/organic-food.avif",
    content:
      "As consumers become more health-conscious, the demand for organic products continues to rise. This blog explores the future of organic food in e-commerce, and how it benefits both customers and the environment.",
  },
  {
    id: 2,
    title: "How to Choose Fresh Produce Online",
    category: "Produce",
    writer: "John Doe",
    date: "2024-09-15",
    image: "/images/blogs/fresh-produce.avif",
    content:
      "Shopping for fresh produce online can be tricky. In this guide, we give you tips on how to choose the freshest fruits and vegetables when shopping on e-commerce platforms.",
  },
  {
    id: 3,
    title: "Top 10 Quick Meal Ideas with Local Ingredients",
    category: "Recipes",
    writer: "Emily Williams",
    date: "2024-09-28",
    image: "/images/blogs/quick-meal.avif",
    content:
      "Discover how you can create quick and nutritious meals using locally-sourced ingredients. This blog provides 10 easy meal ideas for busy individuals.",
  },
  {
    id: 4,
    title: "The Impact of E-Commerce on Food Sustainability",
    category: "Sustainability",
    writer: "Michael Green",
    date: "2024-09-20",
    image: "/images/blogs/sustainability.avif",
    content:
      "The rise of e-commerce is changing the way we approach sustainability in the food industry. Learn how e-commerce platforms are pushing for more eco-friendly practices.",
  },
  {
    id: 5,
    title: "Understanding the Difference Between Organic and Non-Organic Foods",
    category: "Organic",
    writer: "Sarah Thompson",
    date: "2024-10-05",
    image: "/images/blogs/organic-vs-non-organic.avif",
    content:
      "Many people are confused about the difference between organic and non-organic foods. This blog explains the differences and why organic foods are often preferred.",
  },
  {
    id: 6,
    title: "Top 5 Benefits of Buying Groceries Online",
    category: "E-Commerce",
    writer: "John Doe",
    date: "2024-09-30",
    image: "/images/blogs/online-groceries.avif",
    content:
      "With the increasing shift towards online grocery shopping, this blog highlights the top 5 benefits of purchasing groceries online, including convenience, time-saving, and more.",
  },
];
</script>
