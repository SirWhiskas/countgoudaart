// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@vercel/analytics',
    '@vercel/speed-insights',
  ],

  css: ['~/assets/css/main.css', 'primeicons/primeicons.css'],

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'Count Gouda',
      meta: [
        { name: 'description', content: 'Fantasy figure drawings in charcoal by Count Gouda.' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap',
        },
      ],
    },
  },
})
