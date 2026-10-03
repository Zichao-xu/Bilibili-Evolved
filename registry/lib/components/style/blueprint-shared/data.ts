import { getJson, getJsonWithCredentials } from '@/core/ajax'
import { crossOriginLocalStorage } from '@/core/local-storage'
import { getUID } from '@/core/utils'

/** 与脚本自带搜索栏 (LaunchBar) 共用同一份搜索历史 */
export interface HistoryItem {
  value: string
  timestamp: number
}
const historyKey = 'search_history:search_history'
const historyMaxItems = 20

export const getHistory = async (): Promise<HistoryItem[]> => {
  const text = await crossOriginLocalStorage.getItem(historyKey)
  try {
    const items: HistoryItem[] = text ? JSON.parse(text) : []
    return lodash.orderBy(items, it => it.timestamp, 'desc')
  } catch {
    return []
  }
}
const saveHistory = (items: HistoryItem[]) =>
  crossOriginLocalStorage.setItem(historyKey, JSON.stringify(items))

export const addHistory = async (value: string) => {
  const items = (await getHistory()).filter(it => it.value !== value)
  await saveHistory([{ value, timestamp: Date.now() }, ...items].slice(0, historyMaxItems))
}
export const deleteHistory = async (value: string) =>
  saveHistory((await getHistory()).filter(it => it.value !== value))
export const clearHistory = () => saveHistory([])

/** 搜索联想词 */
export const getSuggestions = async (term: string): Promise<string[]> => {
  const params = new URLSearchParams({
    func: 'suggest',
    suggest_type: 'accurate',
    sub_type: 'tag',
    main_ver: 'v1',
    tag_num: '10',
    userid: getUID() ?? '',
    term,
  })
  const json = await getJson(`https://s.search.bilibili.com/main/suggest?${params}`)
  if (json?.code !== 0) {
    return []
  }
  const tags: { value: string }[] = lodash.get(json, 'result.tag', [])
  return lodash.uniq(tags.map(it => it.value).filter(it => it && it !== term))
}

export const searchUrl = (keyword: string) =>
  `https://search.bilibili.com/all?${new URLSearchParams({ keyword })}`

/** 未读消息数: 回复 / @ / 赞 / 系统通知 + 已关注用户私信 */
export const getUnreadCount = async () => {
  const [feed, session] = await Promise.all([
    getJsonWithCredentials('https://api.vc.bilibili.com/x/im/web/msgfeed/unread'),
    getJsonWithCredentials('https://api.vc.bilibili.com/session_svr/v1/session_svr/single_unread'),
  ])
  const counts = feed?.code === 0 ? feed.data : {}
  return (
    (counts.reply ?? 0) +
    (counts.at ?? 0) +
    (counts.like ?? 0) +
    (counts.sys_msg ?? 0) +
    (session?.code === 0 ? session.data.follow_unread ?? 0 : 0)
  )
}

export { getNotifyCount as getFeedsUpdateCount } from '@/components/feeds/notify'
