import type { Post } from "~/types/product";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const defaultBlogPosts: Post[] = [
  {
    id: 1,
    title: "The Future of Organic Food in E-Commerce",
    category: "Organic",
    writer: "Sarah Thompson",
    date: "2024-10-01",
    image: "/images/blogs/organic-food.avif",
    content:
      "As consumers become more health-conscious, the demand for organic products continues to rise. This blog explores the future of organic food in e-commerce, and how it benefits both customers and the environment.",
    slug: slugify("The Future of Organic Food in E-Commerce"),
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
    slug: slugify("How to Choose Fresh Produce Online"),
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
    slug: slugify("Top 10 Quick Meal Ideas with Local Ingredients"),
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
    slug: slugify("The Impact of E-Commerce on Food Sustainability"),
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
    slug: slugify(
      "Understanding the Difference Between Organic and Non-Organic Foods"
    ),
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
    slug: slugify("Top 5 Benefits of Buying Groceries Online"),
  },
];
