import { defineComponentMetadata } from '@/components/define'
import { contentLoaded } from '@/core/life-cycle'
import { mountVueComponent } from '@/core/utils'
import { homeUrls } from '../urls'

export const component = defineComponentMetadata({
  name: 'blueprintHome',
  displayName: '图纸首页',
  author: {
    name: 'Zichao-xu',
    link: 'https://github.com/Zichao-xu',
  },
  urlInclude: homeUrls,
  tags: [componentsTags.style],
  entry: () => {
    contentLoaded(async () => {
      const BlueprintHome = await import('./BlueprintHome.vue')
      const blueprintHome = mountVueComponent(BlueprintHome)
      document.body.appendChild(blueprintHome.$el)
    })
  },
  unload: () => document.body.classList.add('home-redesign-off'),
  reload: () => document.body.classList.remove('home-redesign-off'),
  instantStyles: [
    {
      name: 'blueprint-home-hide-original',
      style: () => import('../hide-original.scss'),
    },
    {
      name: 'blueprint-home-hide-banner-inner',
      style: () => import('../search/hide-banner-inner.scss'),
    },
    {
      name: 'blueprint-home-chrome',
      style: () => import('./blueprint-chrome.scss'),
    },
  ],
})
