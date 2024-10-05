
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  app: {
  head: {
    htmlAttrs: {
      lang: 'en' 
    },
    title: 'Nutriakl - Authentic Pure Food Resources',
      meta: [
        {
          name: 'description',
          content: 'Nutriakl offers the highest quality natural food resources, ensuring purity and sustainability for healthy living.'
        },
        {
          property: 'og:title',
          content: 'Nutriakl - Authentic Pure Food Resources'
        },
        {
          property: 'og:description',
          content: 'Discover the best natural food resources at Nutriakl.'
        },
        {
          property: 'og:image',
          content: '/nutri.png'
        }
      ],
    link: [
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap',
      },
    ],
  },
},
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: [
    '@nuxt/image-edge'
  ],
})