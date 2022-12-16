// import AutoImport from 'unplugin-auto-import/vite'
// import Components from 'unplugin-vue-components/vite'
// import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import ElementPlus from 'unplugin-element-plus/vite'
import VueI18nVitePlugin from '@intlify/unplugin-vue-i18n/vite'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'url'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

const lifecycle = process.env.npm_lifecycle_event

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        // <meta name="description" content="My amazing site">
        { name: 'description', content: 'Shale site.' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },
  postcss: {
    plugins: {
      'postcss-pxtorem': {
        rootValue: 50,
        propList: ['*'],
        mediaQuery: false,
        exclude: /node_modules/i,
      },
    },
  },
  // css
  css: ['~/assets/scss/index.scss'],
  // build
  build: {
    transpile: [
      // https://github.com/element-plus/element-plus-nuxt-starter/blob/44644788ee0d2a2580769769f9885b5cd9f7c0ab/nuxt.config.ts#L27
      ...(lifecycle === 'build' || lifecycle === 'generate'
        ? ['element-plus']
        : []),
      // For importing 'element-plus/es/components/xxx/style/css' to work
      'element-plus/es',
    ],
  },
  vite: {
    plugins: [
      ElementPlus(),
      // AutoImport({
      //   resolvers: [ElementPlusResolver({ ssr: true })],
      // }),
      // Components({
      //   resolvers: [ElementPlusResolver({ ssr: true })],
      // }),
      VueI18nVitePlugin({
        include: [
          resolve(dirname(fileURLToPath(import.meta.url)), './locales/*.json'),
        ],
      }),
    ],
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
        plugins: [NodeGlobalsPolyfillPlugin()],
      },
    },
  },

  // build modules
  modules: [
    [
      '@vueuse/nuxt',
      {
        ssrHandlers: true,
      },
    ],
    '@pinia/nuxt',
  ],
})
