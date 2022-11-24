import fs from 'fs'
import fg from 'fast-glob'
import * as shiki from 'shiki'
import type { LayoutServerLoad } from './$types'
import nightOwlTheme from './night-owl.json'

function capitalizeFirstLetter(input: string) {
  return input.charAt(0).toUpperCase() + input.slice(1)
}
const codeToHTML = async (code: string, lang = 'svelte') =>
  (await shiki.getHighlighter({ theme: nightOwlTheme as any })).codeToHtml(
    code,
    { lang },
  )

export const load: LayoutServerLoad = async ({ route }) => {
  const dirName = import.meta.url.replace(/^file:\/\//, '').replace(/\/\+layout\.server\.ts$/, '')
  const demosDirectory = `${dirName}${route.id}/demos/**/+page.svelte`
  const demoEntries = await fg(demosDirectory)

  const routeIdArr = route.id?.split('/') || []
  routeIdArr.shift()
  const sidebarPathPrefix = routeIdArr.shift() || ''
  const sidebarEntries = await fg(`${dirName}/${sidebarPathPrefix}/*/+page.svelte`)

  const sidebars = sidebarEntries.map((entry) => {
    const to = entry.replace(new RegExp(dirName), '').replace(/\/\+page\.svelte/, '')
    return {
      to,
      label: capitalizeFirstLetter(to.replace(new RegExp(`/${sidebarPathPrefix}/`), '').replace(/\/$/, '')),
    }
  })
  sidebars.sort((s1, s2) => s1.label.charCodeAt(0) - s2.label.charCodeAt(0))

  const demos = demoEntries.map((path) => {
    const pathArr = path.split('/')
    pathArr.pop()
    const demoRoutePath = pathArr.pop()

    return {
      code: fs.readFileSync(path, 'utf-8'),
      iframeUrl: `${route.id}/demos/${demoRoutePath}`,
      name: demoRoutePath?.split('-').map(capitalizeFirstLetter).join(' ') || '',
    }
  })

  for (let i = 0; i < demos.length; i++) {
    const demo = demos[i]
    demo.code = await codeToHTML(demo.code)
  }

  return {
    // Current page demos
    demos,
    // Current sidebars
    sidebars,
  }
}
