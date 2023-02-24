import { defineConfig } from 'vite'
import { mdToSvelte, sveltepress } from '@sveltepress/vite'
import { vitePluginDocParser } from 'vite-plugin-doc-parser'
import { defaultTheme } from '@sveltepress/theme-default'
import { parse } from 'sveltedoc-parser'
import navbar from './config/navbar'
import sidebar from './config/sidebar'
import componentApi from './src/remark-plugins/component-api'

const defaultThemeResolved = defaultTheme({
  navbar,
  sidebar,
  github: 'https://github.com/Casual-UI/svelte',
  editLink: 'https://github.com/Casual-UI/svelte/edit/main/packages/docs-new/src/routes/:route',
  logo: '/logo.png',
  themeColor: {
    light: '#fff',
    dark: '#000',
    gradient: {
      start: '#41D1FF',
      end: '#BD34FE',
    },
    primary: '#8952fd',
    hover: '#618BFF',
  },
})

const config = defineConfig({
  plugins: [
    vitePluginDocParser({
      parser: svelteDocParser,
      extension: '.svelte',
      baseDir: '../ui/src/components/',
    }),
    sveltepress({
      theme: defaultThemeResolved,
      siteConfig: {
        title: 'Casual UI - Svelte',
        description: 'A component library that supports Svelte3+',
      },
      remarkPlugins: [componentApi],
    }),
  ],
})

async function svelteDocParser(filename: string) {
  const api = await parse({
    filename,
    version: 3,
  })

  const admonitionPlugin = defaultThemeResolved.remarkPlugins?.[1]

  const converter = async <T extends Record<string, any>>(d: T) => ({
    ...d,
    description: (await mdToSvelte({
      mdContent: d.description,
      filename: `${filename}.md`,
      highlighter: defaultThemeResolved.highlighter,
      remarkPlugins: admonitionPlugin ? [admonitionPlugin] : [],
    })).code,
  })

  if (api.data)
    api.data = await Promise.all(api.data.map(converter))

  if (api.events)
    api.events = await Promise.all(api.events.map(converter))

  if (api.slots)
  { api.slots = await Promise.all(api.slots?.map(async item => {
    const newItem = await converter(item)
    if (newItem.params) {
      newItem.params = await Promise.all(newItem.params.filter(item => item.name !== 'slot')
        .map(converter))
    }

    return newItem
  })) }

  return api as any
}

export default config
