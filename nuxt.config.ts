export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },

  watch: ['~/**/*.{js,ts,vue}', '!**/node_modules/**', '!**/.nuxt/**', '!**/.output/**', '!**/.opencode/**', '!**/dist/**'],

  nitro: {
    devProxy: {
      '/uploads': {
        target: 'http://localhost:4000/uploads',
        changeOrigin: true,
      },
    },
    compressPublicAssets: true,
  },

  routeRules: {
    '/_nuxt/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
    '/images/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
    '/nutri.png': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
  },

  vite: {
    server: {
      watch: {
        usePolling: true,
        ignored: [
          '**/backend/**',
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/.output/**',
          '**/.nuxt/**',
          '**/.opencode/**',
          '**/nitropack/**',
          '**/@nuxt/**',
          '**/@unhead/**',
          '**/chokidar/**',
        ],
      },
    },
    optimizeDeps: {
      exclude: ['nuxt'],
      include: [],
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
          name: "theme-color",
          content: "#7c3aed",
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "og:site_name",
          content: "NutriZaria",
        },
        {
          property: "og:locale",
          content: "en_US",
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
          content: `${process.env.SITE_URL || "https://nutrizaria.com"}/nutri.png`,
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name: "twitter:title",
          content: "NutriZaria - Authentic Pure Food Resources",
        },
        {
          name: "twitter:description",
          content: "Discover the best natural food resources at NutriZaria.",
        },
        {
          name: "twitter:image",
          content: `${process.env.SITE_URL || "https://nutrizaria.com"}/nutri.png`,
        },
      ],
      link: [
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
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
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: ["@nuxt/image"],
  plugins: ["~/plugins/pinia.ts", "~/plugins/slugify.ts"],  runtimeConfig: {
    public: {
      siteUrl: process.env.SITE_URL || "https://nutrizaria.com",
      apiBase: process.env.API_BASE_URL || "http://localhost:4000/api",
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      checkoutCurrency: process.env.CHECKOUT_CURRENCY || "bdt",
      currencySymbol: process.env.CHECKOUT_CURRENCY_SYMBOL || "Tk",
      adminPassphrase: process.env.ADMIN_PASSPHRASE || "",
      metaPixelId: process.env.META_PIXEL_ID || "",
      enableBkash: process.env.ENABLE_BKASH === "true",
      enableSslcommerz: process.env.ENABLE_SSLCOMMERZ === "true",
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY || "",
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "nutrizaria-27ac1.firebaseapp.com",
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || "nutrizaria-27ac1",
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "nutrizaria-27ac1.firebasestorage.app",
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "589188719972",
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID || "1:589188719972:web:81fb73b34f84ef4e184671",
      firebaseMeasurementId: process.env.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-P37VV5JMNK",
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID || "",
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
