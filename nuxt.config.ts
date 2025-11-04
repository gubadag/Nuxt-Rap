export default defineNuxtConfig({
  ssr: true,
  nitro: { preset: 'node-server' },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
  ],

  icon: {
    // Only use local collections
    size: '24',
    collections: ['material-symbols', 'lucide'],
  }
})
