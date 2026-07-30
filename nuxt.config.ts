export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },

  nitro: {
    devProxy: {
      '/uploads': {
        target: 'http://localhost:4000/uploads',
        changeOrigin: true,
      },
    },
  },

  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      title: "NutriZaria - Authentic Pure Food Resources",
      meta: [
        {
          name: "description",
          content:
            "NutriZaria offers the highest quality natural food resources, ensuring purity and sustainability for healthy living.",
        },
        {
          property: "og:title",
          content: "NutriZaria - Authentic Pure Food Resources",
        },
        {
          property: "og:description",
          content: "Discover the best natural food resources at NutriZaria.",
        },
        {
          property: "og:image",
          content: "/nutri.png",
        },
      ],
      link: [
        {
          rel: "preload",
          href: "https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap",
          as: "style",
          onload: "this.onload=null;this.rel='stylesheet'",
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
  modules: ["@nuxt/image"],
  plugins: ["~/plugins/pinia.ts", "~/plugins/slugify.ts"],
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || "http://localhost:4000/api",
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      checkoutCurrency: process.env.CHECKOUT_CURRENCY || "bdt",
      currencySymbol: process.env.CHECKOUT_CURRENCY_SYMBOL || "Tk",
      adminPassphrase: process.env.ADMIN_PASSPHRASE || "",
      metaPixelId: process.env.META_PIXEL_ID || "",
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
    formats: ["avif", "webp"],
    domains: ['localhost'],
    ipx: {
      detectHost: false,
    },
  },
});
