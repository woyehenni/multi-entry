import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mpa from 'vite-plugin-multi-pages'
import htmlTemplate from 'vite-plugin-html-template-mpa'
import htmlTransform from './plugins/vite-plugin-html-transform'
import zip from './plugins/zip'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    mpa({
      scanDir: 'src/modules',
      ignorePageNames: 'page1,samples'
    }),
    htmlTemplate({
      pagesDir: 'src/modules',
      pages: {
        app1: {
          title: 'App1'
        },
        app2: {
          title: 'App2'
        },
        app3: {
          title: 'App3'
        }
      },
      buildCfg: {
        moveHtmlTop: true,
        moveHtmlDirTop: false,
        buildPrefixName: '',
        htmlHash: false,
        // htmlPrefixSearchValue: '../../../',
        // htmlPrefixReplaceValue: './'
      }
    }),
    htmlTransform({
      replaces: [
        {
          from: '\/js\/',
          to: './js/'
        },
        {
          from: '\/assets\/',
          to: './assets/'
        }
      ]
    }),
    zip(['app1', 'app2', 'app3'])
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    target: ['esnext'],
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/common/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  }
})
