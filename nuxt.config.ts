export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      title: "Nutriakl - Authentic Pure Food Resources",
      meta: [
        {
          name: "description",
          content:
            "Nutriakl offers the highest quality natural food resources, ensuring purity and sustainability for healthy living.",
        },
        {
          property: "og:title",
          content: "Nutriakl - Authentic Pure Food Resources",
        },
        {
          property: "og:description",
          content: "Discover the best natural food resources at Nutriakl.",
        },
        {
          property: "og:image",
          content: "/nutri.png",
        },
      ],
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap",
        },
      ],
    },
  },
  css: [
    "~/assets/css/main.css",
    "quill/dist/quill.snow.css",
    "quill/dist/quill.bubble.css",
    "quill/dist/quill.core.css",
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: ["@nuxt/image-edge", "@nuxt/image"],
  plugins: ["~/plugins/pinia.ts", "~/plugins/slugify.ts"],
  runtimeConfig: {
    public: {
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    },
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  },

  image: {
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },
});
