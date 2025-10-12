// https://nuxt.com/docs/api/configuration/nuxt-config
import hooks from './hooks/hooks';
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  build: {
    transpile: []
  },
  modules: [
    '@nuxt/eslint',
    'nuxt-auth-utils',
    'nuxt-toastify',
  ],
  hooks: hooks(this),
  vite: {
    server: {
      allowedHosts: ["testtunnel.yourdomain.com"]
    }
  },
  watch: [
    /server\/nodes\/.*\.js/,
    /components\/.*\.json/,
  ],
  rules: {
//    "no-duplicate-imports": "off",
  },
  runtimeConfig: {
    public: {
      STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
      HAS_FACEBOOK_AUTH: process.env.NUXT_OAUTH_FACEBOOK_CLIENT_ID ? true : false,
      HAS_GOOGLE_AUTH: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID ? true : false,
    },
    STRIPE_PRIVATE_KEY: process.env.STRIPE_PRIVATE_KEY,
  }
})
