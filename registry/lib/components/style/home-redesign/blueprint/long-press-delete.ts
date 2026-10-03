/** 长按多久触发删除 (与 SCSS 中进度条动画时长保持一致) */
export const holdDuration = 550
const exitDuration = 200
const moveTolerance = 8

const itemSelector = '.be-launch-bar-suggest-item'
const deleteSelector = '.be-launch-bar-suggest-item-delete'
const holdingClass = 'bp-holding'
const removingClass = 'bp-removing'

const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()))

/** 删除后其余标签从原位置弹性滑到新位置 (FLIP) */
const animateReflow = async (list: Element, removed: HTMLElement) => {
  const items = () =>
    [...list.querySelectorAll<HTMLElement>(itemSelector)].filter(it => it !== removed)
  const before = new Map(items().map(it => [it.title, it.getBoundingClientRect()]))
  removed.querySelector<HTMLElement>(deleteSelector)?.click()
  await nextFrame()
  await nextFrame()
  items().forEach(it => {
    const from = before.get(it.title)
    if (!from) {
      return
    }
    const to = it.getBoundingClientRect()
    const dx = from.left - to.left
    const dy = from.top - to.top
    if (dx === 0 && dy === 0) {
      return
    }
    it.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], {
      duration: 320,
      easing: 'cubic-bezier(0.34, 1.32, 0.64, 1)',
    })
  })
}

/**
 * 在 root 内为可删除的候选标签 (搜索历史) 提供长按删除:
 * 按住时显示进度, 中途松开/移开则取消, 按满后播放退场动画再删除
 */
export const setupLongPressDelete = (root: HTMLElement) => {
  let target: HTMLElement | null = null
  let timer = 0
  let startX = 0
  let startY = 0
  let suppressClick = false

  const cancel = () => {
    window.clearTimeout(timer)
    target?.classList.remove(holdingClass)
    target = null
  }

  const complete = async (item: HTMLElement) => {
    suppressClick = true
    item.classList.remove(holdingClass)
    item.classList.add(removingClass)
    const list = item.parentElement
    await new Promise(resolve => window.setTimeout(resolve, exitDuration))
    if (list) {
      await animateReflow(list, item)
    }
    item.classList.remove(removingClass)
  }

  const onPointerDown = (e: PointerEvent) => {
    suppressClick = false
    if (e.button !== 0) {
      return
    }
    const item = (e.target as Element).closest<HTMLElement>(itemSelector)
    if (!item || !item.querySelector(deleteSelector)) {
      return
    }
    cancel()
    target = item
    startX = e.clientX
    startY = e.clientY
    item.classList.add(holdingClass)
    timer = window.setTimeout(() => {
      target = null
      complete(item)
    }, holdDuration)
  }

  const onPointerMove = (e: PointerEvent) => {
    if (
      target &&
      (Math.abs(e.clientX - startX) > moveTolerance || Math.abs(e.clientY - startY) > moveTolerance)
    ) {
      cancel()
    }
  }

  // 长按完成后紧跟的 click 不应再触发搜索
  const onClick = (e: MouseEvent) => {
    // 放行代码触发的删除按钮点击
    if ((e.target as Element).closest(deleteSelector)) {
      return
    }
    if (suppressClick) {
      suppressClick = false
      e.stopPropagation()
      e.preventDefault()
    }
  }

  const onContextMenu = (e: Event) => {
    if ((e.target as Element).closest(itemSelector)) {
      e.preventDefault()
    }
  }

  root.addEventListener('pointerdown', onPointerDown, true)
  root.addEventListener('pointermove', onPointerMove, true)
  // 松手可能发生在 root 之外, 监听 window
  window.addEventListener('pointerup', cancel, true)
  window.addEventListener('pointercancel', cancel, true)
  root.addEventListener('click', onClick, true)
  root.addEventListener('contextmenu', onContextMenu, true)
  return () => {
    cancel()
    root.removeEventListener('pointerdown', onPointerDown, true)
    root.removeEventListener('pointermove', onPointerMove, true)
    window.removeEventListener('pointerup', cancel, true)
    window.removeEventListener('pointercancel', cancel, true)
    root.removeEventListener('click', onClick, true)
    root.removeEventListener('contextmenu', onContextMenu, true)
  }
}
