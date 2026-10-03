import {
  defineComponentMetadata,
  defineOptionsMetadata,
  OptionsOfMetadata,
} from '@/components/define'
import { addComponentListener, removeComponentListener } from '@/core/settings'
import { getNumberValidator } from '@/core/utils'
import { startMasonry } from './layout'

const name = 'feedsMultiColumn'

const options = defineOptionsMetadata({
  columnCount: {
    displayName: '列数',
    defaultValue: 2,
    slider: {
      min: 1,
      max: 4,
      step: 1,
    },
    validator: getNumberValidator(1, 4),
  },
})
export type FeedsMultiColumnOptions = OptionsOfMetadata<typeof options>

let stopMasonry: (() => void) | undefined

const applyColumnCount = (count: number) => {
  document.documentElement.style.setProperty('--be-feeds-column-count', count.toString())
}

export const component = defineComponentMetadata({
  name,
  displayName: '动态多列',
  author: {
    name: 'Zichao-xu',
    link: 'https://github.com/Zichao-xu',
  },
  options,
  tags: [componentsTags.feeds],
  urlInclude: [/^https:\/\/t\.bilibili\.com\/(\?.*)?$/],
  instantStyles: [
    {
      name,
      style: () => import('./multi-column.scss'),
      important: true,
    },
  ],
  entry: async () => {
    addComponentListener(`${name}.columnCount`, applyColumnCount, true)
    stopMasonry = await startMasonry()
  },
  reload: async () => {
    addComponentListener(`${name}.columnCount`, applyColumnCount, true)
    stopMasonry = await startMasonry()
  },
  unload: () => {
    stopMasonry?.()
    stopMasonry = undefined
    removeComponentListener(`${name}.columnCount`, applyColumnCount)
    document.documentElement.style.removeProperty('--be-feeds-column-count')
  },
})
