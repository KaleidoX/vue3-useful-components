import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// vite 项目降级
// import legacy from '@vitejs/plugin-legacy'

import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver, VantResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const EnvConfig = loadEnv(mode, process.cwd(), '')
  return {
    base: EnvConfig.BASE_URL,
    // base: "./",
    server: {
      port: '8000',
      open: false,
      proxy: {
        [EnvConfig.VITE_BASE_API]: {
          target: EnvConfig.VITE_BASE_HOST,
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${EnvConfig.VITE_BASE_API}`), '')
        }
      }
    },
    plugins: [
      vue(),
      vueJsx(),
      AutoImport({
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/ // .vue
        ],
        dts: './src/auto-imports.d.ts',
        imports: ['vue', 'pinia', 'vue-router', '@vueuse/core'],
        dirs: ['./src/composables/**', './src/stores/**', './src/types/**', './src/utils/**'],
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        dts: './src/components.d.ts',
        resolvers: [ElementPlusResolver(), VantResolver()]
      }),
      // legacy({
      //   ignoreBrowserslistConfig: true,
      //   modernPolyfills: true,
      //   renderLegacyChunks: false
      // }),
      UnoCSS()
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    build: {
      minify: 'terser',
      terserOptions: {
        // 生产环境下移除console
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        // input: {
        //   main: resolve(__dirname, 'index.html'),
        //   mobile: resolve(__dirname, 'mobile.html')
        // },
        output: {
          // key自定义 value[] 插件同步package.json名称 或 src/相对路径下的指定文件 （自己可以看manualChunks ts类型）
          manualChunks: {
            // vue vue-router合并打包
            base: ['vue', 'vue-router', 'pinia', 'nprogress', 'axios'],
            lodash: ['lodash-es'],
            elementPlus: ['element-plus'],
            vant: ['vant'],
            videoJs: ['video.js', 'mpegts.js']
          }
        }
      }
    }
  }
})
