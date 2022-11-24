import { resolve } from 'path'
import { defineConfig } from 'vite'
import { presetAttributify, presetIcons, presetUno } from 'unocss'
import Unocss from 'unocss/vite'
// import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [
    Unocss({
      presets: [
        presetUno(),
        presetAttributify(),
        presetIcons(),
      ],
    })],
  build: {
    lib: {
      name: 'CasualUISvelte',
      fileName: () => 'import-style.js',
      entry: resolve(process.cwd(), './src/import-style.js'),
      formats: ['es'],
    },
  },
})
