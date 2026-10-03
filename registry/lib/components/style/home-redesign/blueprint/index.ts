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
      document.body.appendChild(mountVueComponent(BlueprintHome).$el)
    })
  },
  unload: () => document.body.classList.add('home-redesign-off'),
  reload: () => document.body.classList.remove('home-redesign-off'),
  instantStyles: [
    {
      name: 'blueprint-home-takeover',
      style: () => import('./takeover.scss'),
    },
  ],
})
