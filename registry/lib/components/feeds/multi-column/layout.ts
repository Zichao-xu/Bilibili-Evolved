import { childListSubtree, sizeChange } from '@/core/observer'
import { select } from '@/core/spin-query'

/** 与 multi-column.scss 中的列间距一致, 也作为卡片之间的纵向间距 */
const gap = 12
const itemSelector = '.bili-dyn-list__item'

/**
 * 瀑布流: 网格行高为 1px, 每张卡片按实际高度占对应行数,
 * 网格按顺序把卡片放进最先空出来的位置, 列之间不再出现空隙
 */
const setSpan = (item: HTMLElement, height: number) => {
  const span = `span ${Math.ceil(height + gap)}`
  if (item.style.gridRowEnd !== span) {
    item.style.gridRowEnd = span
  }
}

export const startMasonry = async () => {
  const main = await select('.bili-dyn-home--member > main')
  if (!main) {
    return () => undefined
  }
  const observed = new WeakSet<Element>()
  // 图片加载、展开全文等都会改变卡片高度, 需要持续跟踪
  const [resizeObserver] = sizeChange([], entries => {
    entries.forEach(entry => {
      setSpan(entry.target as HTMLElement, entry.borderBoxSize[0].blockSize)
    })
  })
  // 无限滚动追加的卡片, 以及切换「全部 / 视频投稿」等标签时整个列表被替换
  const [mutationObserver] = childListSubtree(main, () => {
    main.querySelectorAll<HTMLElement>(itemSelector).forEach(item => {
      if (!observed.has(item)) {
        observed.add(item)
        resizeObserver.observe(item, { box: 'border-box' })
      }
    })
  })
  return () => {
    mutationObserver.disconnect()
    resizeObserver.disconnect()
    main.querySelectorAll<HTMLElement>(itemSelector).forEach(item => {
      item.style.removeProperty('grid-row-end')
    })
  }
}
