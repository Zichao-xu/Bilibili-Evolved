<template>
  <header class="bp-navbar">
    <a class="bp-navbar-logo" href="https://www.bilibili.com/" aria-label="bilibili 首页">
      <VIcon icon="logo" :size="34" />
    </a>
    <SearchBox
      v-if="showSearch"
      class="bp-navbar-search"
      size="compact"
      shortcut
      :initial-query="initialQuery"
    />
    <div class="bp-navbar-right">
      <a class="bp-navbar-link" href="https://t.bilibili.com/">
        动态<span v-if="feedsCount > 0" class="bp-badge">{{ feedsCount }}</span>
      </a>
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
              <span v-if="link.count" class="bp-badge">{{ link.count }}</span>
            </a>
          </nav>
        </transition>
      </div>
      <a v-else-if="user" class="bp-navbar-link" href="https://passport.bilibili.com/login">
        登录
      </a>
    </div>
  </header>
</template>
<script lang="ts">
import { getUserInfo } from '@/core/user-info'
import { VIcon } from '@/ui'
import SearchBox from '../blueprint-shared/SearchBox.vue'
import { getFeedsUpdateCount, getUnreadCount } from '../blueprint-shared/data'

export default Vue.extend({
  components: {
    VIcon,
    SearchBox,
  },
  props: {
    showSearch: {
      type: Boolean,
      default: true,
    },
    initialQuery: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      user: null as { isLogin: boolean; uname?: string; face?: string; mid?: number } | null,
      unread: 0,
      feedsCount: 0,
      menuOpen: false,
    }
  },
  computed: {
    links(): { name: string; url: string; count?: number }[] {
      const mid = this.user?.mid
      return [
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
      const [unread, feedsCount] = await Promise.all([
        getUnreadCount().catch(() => 0),
        getFeedsUpdateCount().catch(() => 0),
      ])
      this.unread = unread
      this.feedsCount = feedsCount
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
<style lang="scss">
@import '../blueprint-shared/tokens';

.bp-navbar {
  @include tokens;
  @include reset;

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10010;
  // 与原版顶栏占位等高 (含底线)
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: 64px;
  padding: 0 var(--bp-gutter);
  background-color: var(--bp-bg);
  border-bottom: 1px solid var(--bp-line-major);

  .bp-navbar-logo {
    justify-self: start;
    display: flex;
    color: var(--bp-ink);
    transition: opacity 0.2s ease-out;
    // logo 字形宽约为字号的 2.2 倍, 图标框随字形自适应
    .be-icon {
      width: auto !important;
    }
    &:hover {
      opacity: 0.7;
    }
  }
  .bp-navbar-search {
    grid-column: 2;
    width: min(440px, 36vw);
  }
  .bp-navbar-right {
    grid-column: 3;
    justify-self: end;
    display: flex;
    align-items: center;
    gap: 24px;
  }
  .bp-navbar-link {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--bp-dim);
    transition: color 0.15s ease-out;
    &:hover {
      color: var(--bp-ink);
    }
  }
  .bp-badge {
    min-width: 18px;
    padding: 0 5px;
    font-family: var(--bp-mono);
    font-size: 11px;
    line-height: 16px;
    text-align: center;
    color: #fff;
    background-color: var(--bp-accent);
  }

  .bp-user {
    position: relative;
  }
  .bp-avatar {
    position: relative;
    display: block;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    box-shadow: 0 0 0 2px var(--bp-bg), 0 0 0 3px var(--bp-faint);
    transition: box-shadow 0.2s ease-out;
    img {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
    &:hover,
    &[aria-expanded='true'] {
      box-shadow: 0 0 0 2px var(--bp-bg), 0 0 0 3px var(--bp-ink);
    }
  }
  .bp-unread {
    position: absolute;
    top: -3px;
    right: -3px;
    width: 7px;
    height: 7px;
    background-color: var(--bp-accent);
    box-shadow: 0 0 0 2px var(--bp-bg);
  }
  .bp-menu {
    position: absolute;
    top: calc(100% + 16px);
    right: 0;
    width: 220px;
    border: 1px solid var(--bp-faint);
    background-color: var(--bp-surface);
    transform-origin: top right;
  }
  .bp-menu-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--bp-faint);
    font-family: var(--bp-mono);
    font-size: 11px;
    letter-spacing: 0.04em;
    color: var(--bp-dim);
    span:first-child {
      overflow: hidden;
      color: var(--bp-ink);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .bp-menu-item {
    display: flex;
    align-items: baseline;
    gap: 12px;
    padding: 9px 14px;
    transition: background-color 0.15s ease-out;
    & + & {
      border-top: 1px solid var(--bp-line-major);
    }
    &:hover {
      background-color: var(--bp-hover);
    }
  }
  .bp-menu-index {
    font-family: var(--bp-mono);
    font-size: 11px;
    color: var(--bp-dim);
  }
  .bp-menu-name {
    flex: 1;
  }
  .bp-menu-enter-active {
    transition: opacity 0.18s ease-out, transform 0.32s var(--bp-spring);
  }
  .bp-menu-leave-active {
    transition: opacity 0.12s var(--bp-exit), transform 0.12s var(--bp-exit);
  }
  .bp-menu-enter,
  .bp-menu-leave-to {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
  }
}
</style>
