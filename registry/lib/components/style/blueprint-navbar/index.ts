import { defineComponentMetadata } from '@/components/define'
import { contentLoaded } from '@/core/life-cycle'
import {
  createComponentWithProps,
  isIframe,
  matchUrlPattern,
  mountVueComponent,
} from '@/core/utils'
import { homeUrls } from '../home-redesign/urls'
import { syncThemeWithSystem } from '../blueprint-shared/theme'

const name = 'blueprintNavbar'

let navbar: HTMLElement | undefined

const getInitialQuery = () =>
  window.location.host === 'search.bilibili.com'
    ? new URLSearchParams(window.location.search).get('keyword') ?? ''
    : ''

const mount = async () => {
  const BlueprintNavbar = await import('./BlueprintNavbar.vue')
  const isHome = homeUrls.some(url => matchUrlPattern(url))
  const vm = mountVueComponent(
    createComponentWithProps(BlueprintNavbar.default, {
      // 首页中央已有大号搜索框
      showSearch: !isHome,
      initialQuery: getInitialQuery(),
    }),
  )
  navbar = vm.$el as HTMLElement
  document.body.appendChild(navbar)
}

export const component = defineComponentMetadata({
  name,
  displayName: '图纸顶栏',
  author: {
    name: 'Zichao-xu',
    link: 'https://github.com/Zichao-xu',
  },
  tags: [componentsTags.style],
  urlInclude: [/^https:\/\/(www|search|t|space|message)\.bilibili\.com\//],
  urlExclude: [/^https:\/\/www\.bilibili\.com\/blackboard\//],
  instantStyles: [
    {
      name: 'blueprint-navbar-takeover',
      style: () => import('./takeover.scss'),
    },
  ],
  entry: () => {
    if (isIframe()) {
      return
    }
    syncThemeWithSystem()
    contentLoaded(mount)
  },
  unload: () => {
    navbar?.remove()
    navbar = undefined
  },
  reload: () => {
    contentLoaded(mount)
  },
})
