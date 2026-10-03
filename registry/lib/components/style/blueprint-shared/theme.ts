import { getCookieValue } from '@/core/utils'

const guardKey = 'bp-theme-sync'
const guardWindow = 10_000

/**
 * 让 B 站官方深浅色主题 (theme_style cookie) 跟随系统外观.
 * B 站切换主题需要刷新页面; 同一标签页 10 秒内不重复刷新同一目标, 防止 cookie 被改回时循环刷新.
 */
export const syncThemeWithSystem = () => {
  const media = matchMedia('(prefers-color-scheme: dark)')
  const apply = async () => {
    const target = media.matches ? 'dark' : 'light'
    if (getCookieValue('theme_style') === target) {
      return
    }
    const last = JSON.parse(sessionStorage.getItem(guardKey) ?? 'null') as {
      target: string
      time: number
    } | null
    if (last?.target === target && Date.now() - last.time < guardWindow) {
      return
    }
    sessionStorage.setItem(guardKey, JSON.stringify({ target, time: Date.now() }))
    await cookieStore.set({
      name: 'theme_style',
      value: target,
      domain: 'bilibili.com',
      path: '/',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
    })
    location.reload()
  }
  apply()
  media.addEventListener('change', apply)
}
