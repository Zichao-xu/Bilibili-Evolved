<template>
  <header class="bp-head">
    <nav class="bp-nav">
      <a class="bp-logo" href="https://www.bilibili.com/" aria-label="bilibili 首页">
        <VIcon icon="logo" :size="38" />
      </a>
      <a class="bp-nav-link" href="https://t.bilibili.com/">动态</a>
    </nav>
    <div v-if="user && user.isLogin" ref="user" class="bp-user">
      <button
        class="bp-avatar"
        type="button"
        :aria-expanded="menuOpen"
        aria-haspopup="menu"
        :aria-label="`${user.uname} 的菜单`"
        @click="menuOpen = !menuOpen"
      >
        <img :src="`${user.face}@72w_72h_1c`" alt="" />
        <i v-if="unread > 0" class="bp-unread" aria-hidden="true"></i>
      </button>
      <transition name="bp-menu">
        <nav v-if="menuOpen" class="bp-menu" role="menu">
          <div class="bp-menu-head">
            <span>{{ user.uname }}</span>
            <span>UID {{ user.mid }}</span>
          </div>
          <a
            v-for="(link, index) of links"
            :key="link.name"
            class="bp-menu-item"
            role="menuitem"
            :href="link.url"
          >
            <span class="bp-menu-index">{{ pad(index + 1) }}</span>
            <span class="bp-menu-name">{{ link.name }}</span>
            <span v-if="link.count" class="bp-menu-count">{{ link.count }}</span>
          </a>
        </nav>
      </transition>
    </div>
    <a v-else-if="user" class="bp-login" href="https://passport.bilibili.com/login">LOGIN →</a>
  </header>
</template>
<script lang="ts">
import { getUserInfo } from '@/core/user-info'
import { VIcon } from '@/ui'
import { getUnreadCount } from './data'

export default Vue.extend({
  components: {
    VIcon,
  },
  data() {
    return {
      user: null as { isLogin: boolean; uname?: string; face?: string; mid?: number } | null,
      unread: 0,
      menuOpen: false,
    }
  },
  computed: {
    links(): { name: string; url: string; count?: number }[] {
      const mid = this.user?.mid
      return [
        { name: '动态', url: 'https://t.bilibili.com/' },
        { name: '消息', url: 'https://message.bilibili.com/', count: this.unread },
        { name: '历史', url: 'https://www.bilibili.com/account/history' },
        { name: '稍后再看', url: 'https://www.bilibili.com/watchlater/#/list' },
        { name: '收藏', url: `https://space.bilibili.com/${mid}/favlist` },
        { name: '个人空间', url: `https://space.bilibili.com/${mid}` },
      ]
    },
  },
  async mounted() {
    document.addEventListener('pointerdown', this.onOutside, true)
    document.addEventListener('keydown', this.onKeydown)
    this.user = await getUserInfo()
    if (this.user.isLogin) {
      this.unread = await getUnreadCount().catch(() => 0)
    }
  },
  beforeDestroy() {
    document.removeEventListener('pointerdown', this.onOutside, true)
    document.removeEventListener('keydown', this.onKeydown)
  },
  methods: {
    pad(value: number) {
      return value.toString().padStart(2, '0')
    },
    onOutside(e: PointerEvent) {
      const root = this.$refs.user as HTMLElement | undefined
      if (this.menuOpen && root && !root.contains(e.target as Node)) {
        this.menuOpen = false
      }
    },
    onKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        this.menuOpen = false
      }
    },
  },
})
</script>
