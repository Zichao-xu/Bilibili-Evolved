<template>
  <div class="bp-search" :class="`bp-search--${size}`">
    <form class="bp-field" role="search" @submit.prevent="submit">
      <input
        ref="input"
        v-model="query"
        class="bp-input"
        type="text"
        role="combobox"
        autocomplete="off"
        spellcheck="false"
        :placeholder="placeholder"
        aria-label="搜索"
        :aria-expanded="focused"
        :aria-controls="listId"
        @focus="onFocus"
        @blur="focused = false"
        @keydown="onKeydown"
      />
      <button class="bp-submit" type="submit" aria-label="搜索">
        <VIcon icon="right-arrow" :size="size === 'hero' ? 18 : 16" />
      </button>
    </form>

    <transition name="bp-panel">
      <div v-if="focused" class="bp-panel" @pointerdown.prevent>
        <div class="bp-panel-head">
          <span>{{ mode === 'history' ? 'HISTORY' : 'SUGGEST' }}</span>
          <button
            v-if="mode === 'history' && chips.length > 0"
            class="bp-text-button"
            type="button"
            @click="clearAll"
          >
            CLEAR ALL
          </button>
        </div>
        <transition-group :id="listId" tag="div" name="bp-chip" class="bp-chips" role="listbox">
          <button
            v-for="(chip, index) of chips"
            :key="`${mode}:${chip}`"
            class="bp-chip"
            :class="{
              active: index === activeIndex,
              holding: chip === holding,
              removing: chip === removing,
            }"
            :style="{ '--i': index }"
            type="button"
            role="option"
            :aria-selected="index === activeIndex"
            @click="onChipClick(chip)"
            @pointerdown="startHold(chip, $event)"
            @pointermove="moveHold"
            @pointerup="cancelHold"
            @pointercancel="cancelHold"
            @contextmenu.prevent
          >
            <template v-if="mode === 'suggest'">
              <span
                v-for="(part, partIndex) of highlight(chip)"
                :key="partIndex"
                :class="{ 'bp-hit': part.hit }"
                >{{ part.text }}</span
              >
            </template>
            <template v-else>{{ chip }}</template>
          </button>
        </transition-group>
        <div v-if="chips.length === 0" class="bp-empty">
          {{ mode === 'history' ? 'NO HISTORY' : loading ? 'LOADING…' : 'NO MATCH' }}
        </div>
        <div v-if="mode === 'history' && chips.length > 0" class="bp-panel-foot">
          HOLD TO REMOVE
        </div>
      </div>
    </transition>
  </div>
</template>
<script lang="ts">
import { VIcon } from '@/ui'
import {
  addHistory,
  clearHistory,
  deleteHistory,
  getHistory,
  getSuggestions,
  HistoryItem,
  searchUrl,
} from './data'

/** 长按删除所需时长, 与 SCSS 中 .holding 的进度动画一致 */
const holdDuration = 550
const removeDuration = 200
const holdMoveTolerance = 8

export default Vue.extend({
  components: {
    VIcon,
  },
  props: {
    /** hero: 首页中央的大号搜索框; compact: 顶栏中的搜索框 */
    size: {
      type: String as () => 'hero' | 'compact',
      default: 'compact',
    },
    /** 是否响应全局 `/` 快捷键聚焦, 同一页面只应有一个 */
    shortcut: {
      type: Boolean,
      default: false,
    },
    initialQuery: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '搜索视频、番剧、UP 主',
    },
  },
  data() {
    return {
      query: this.initialQuery,
      focused: false,
      history: [] as HistoryItem[],
      suggestions: [] as string[],
      loading: false,
      activeIndex: -1,
      holding: null as string | null,
      removing: null as string | null,
      holdTimer: 0,
      holdOrigin: { x: 0, y: 0 },
      suppressClick: false,
      suggestSequence: 0,
      listId: `bp-chips-${Math.random().toString(36).slice(2, 8)}`,
    }
  },
  computed: {
    keyword(): string {
      return this.query.trim()
    },
    mode(): 'history' | 'suggest' {
      return this.keyword ? 'suggest' : 'history'
    },
    chips(): string[] {
      return this.mode === 'history' ? this.history.map(it => it.value) : this.suggestions
    },
  },
  watch: {
    keyword(value: string) {
      this.activeIndex = -1
      this.fetchSuggestions(value)
    },
  },
  created() {
    this.fetchSuggestions = lodash.debounce(this.fetchSuggestions, 120)
  },
  mounted() {
    if (this.shortcut) {
      document.addEventListener('keydown', this.onGlobalKeydown)
    }
  },
  beforeDestroy() {
    window.clearTimeout(this.holdTimer)
    document.removeEventListener('keydown', this.onGlobalKeydown)
  },
  methods: {
    async onFocus() {
      this.focused = true
      this.history = await getHistory()
    },
    async fetchSuggestions(term: string) {
      const sequence = ++this.suggestSequence
      if (!term) {
        this.suggestions = []
        return
      }
      this.loading = true
      const suggestions = await getSuggestions(term).catch(() => [] as string[])
      if (sequence === this.suggestSequence) {
        this.suggestions = suggestions
        this.loading = false
      }
    },
    highlight(chip: string) {
      const index = chip.toLowerCase().indexOf(this.keyword.toLowerCase())
      if (index === -1) {
        return [{ text: chip, hit: false }]
      }
      const end = index + this.keyword.length
      return [
        { text: chip.slice(0, index), hit: false },
        { text: chip.slice(index, end), hit: true },
        { text: chip.slice(end), hit: false },
      ].filter(it => it.text)
    },
    async search(value: string) {
      const keyword = value.trim()
      if (!keyword) {
        return
      }
      await addHistory(keyword)
      window.location.href = searchUrl(keyword)
    },
    submit() {
      this.search(this.activeIndex >= 0 ? this.chips[this.activeIndex] : this.query)
    },
    onChipClick(chip: string) {
      if (this.suppressClick) {
        this.suppressClick = false
        return
      }
      this.search(chip)
    },
    onKeydown(e: KeyboardEvent) {
      const count = this.chips.length
      if (e.key === 'ArrowDown' && count > 0) {
        e.preventDefault()
        this.activeIndex = (this.activeIndex + 1) % count
      } else if (e.key === 'ArrowUp' && count > 0) {
        e.preventDefault()
        this.activeIndex = this.activeIndex <= 0 ? -1 : this.activeIndex - 1
      } else if (e.key === 'Escape') {
        if (this.activeIndex >= 0) {
          this.activeIndex = -1
        } else {
          ;(this.$refs.input as HTMLInputElement).blur()
        }
      } else if (
        e.key === 'Delete' &&
        e.shiftKey &&
        this.mode === 'history' &&
        this.activeIndex >= 0
      ) {
        e.preventDefault()
        this.remove(this.chips[this.activeIndex])
      }
    },
    onGlobalKeydown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (
        e.key === '/' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !target.closest('input, textarea, [contenteditable]')
      ) {
        e.preventDefault()
        ;(this.$refs.input as HTMLInputElement).focus()
      }
    },
    startHold(chip: string, e: PointerEvent) {
      this.suppressClick = false
      if (this.mode !== 'history' || e.button !== 0 || this.removing) {
        return
      }
      // 捕获指针, 保证在标签外松手也能收到 pointerup; 指针已失效时会抛错, 不影响长按本身
      try {
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      } catch {
        // ignore
      }
      this.holdOrigin = { x: e.clientX, y: e.clientY }
      this.holding = chip
      this.holdTimer = window.setTimeout(() => {
        this.holding = null
        this.suppressClick = true
        this.remove(chip)
      }, holdDuration)
    },
    moveHold(e: PointerEvent) {
      if (
        this.holding &&
        Math.hypot(e.clientX - this.holdOrigin.x, e.clientY - this.holdOrigin.y) > holdMoveTolerance
      ) {
        this.cancelHold()
      }
    },
    cancelHold() {
      window.clearTimeout(this.holdTimer)
      this.holding = null
    },
    async remove(chip: string) {
      this.removing = chip
      await new Promise(resolve => window.setTimeout(resolve, removeDuration))
      this.history = this.history.filter(it => it.value !== chip)
      this.removing = null
      this.activeIndex = Math.min(this.activeIndex, this.chips.length - 1)
      await deleteHistory(chip)
    },
    async clearAll() {
      this.history = []
      this.activeIndex = -1
      await clearHistory()
    },
  },
})
</script>
<style lang="scss">
// 配色变量由外层 (.bp-root / .bp-navbar) 通过 _tokens.scss 提供
.bp-search {
  --bp-chamfer: 12px;
  --bp-field-height: 48px;
  --bp-field-font: 16px;
  position: relative;

  &--compact {
    --bp-chamfer: 8px;
    --bp-field-height: 34px;
    --bp-field-font: 14px;
  }

  // 斜切角用伪元素绘制, 不用 clip-path, 否则会把下拉面板一起裁掉
  .bp-field {
    --bp-field-border: var(--bp-border);
    position: relative;
    display: flex;
    align-items: center;
    border: 1px solid var(--bp-field-border);
    background-color: var(--bp-bg);
    transition: border-color 0.2s ease-out;
    &::after {
      content: '';
      position: absolute;
      top: -1px;
      right: -1px;
      width: var(--bp-chamfer);
      height: var(--bp-chamfer);
      pointer-events: none;
      background: linear-gradient(
        225deg,
        var(--bp-bg) calc(50% - 0.6px),
        var(--bp-field-border) calc(50% - 0.6px),
        var(--bp-field-border) calc(50% + 0.6px),
        transparent calc(50% + 0.6px)
      );
    }
    &:focus-within {
      --bp-field-border: var(--bp-ink);
    }
  }
  &--compact .bp-field {
    --bp-field-border: var(--bp-faint);
  }
  .bp-input {
    flex: 1;
    min-width: 0;
    height: var(--bp-field-height);
    padding: 0 calc(var(--bp-field-height) / 3);
    border: none;
    outline: none !important;
    background: transparent;
    color: var(--bp-ink);
    font: var(--bp-field-font) var(--bp-sans);
    caret-color: var(--bp-accent);
    &::placeholder {
      color: var(--bp-dim);
    }
  }
  .bp-submit {
    display: flex;
    align-items: center;
    height: var(--bp-field-height);
    padding: 0 calc(var(--bp-field-height) / 3);
    color: var(--bp-dim);
    transition: color 0.15s ease-out;
    &:hover {
      color: var(--bp-ink);
    }
  }

  // ---------- 候选面板 ----------
  .bp-panel {
    position: absolute;
    top: calc(100% + var(--bp-panel-offset, 8px));
    left: 0;
    right: 0;
    z-index: 1;
    padding: 12px 14px 14px;
    border: 1px solid var(--bp-faint);
    background-color: var(--bp-surface);
    transform-origin: top center;
  }
  .bp-panel-enter-active {
    transition: opacity 0.18s ease-out, transform 0.34s var(--bp-spring);
  }
  .bp-panel-leave-active {
    transition: opacity 0.12s var(--bp-exit), transform 0.12s var(--bp-exit);
  }
  .bp-panel-enter,
  .bp-panel-leave-to {
    opacity: 0;
    transform: translateY(-6px);
  }
  .bp-panel-head,
  .bp-panel-foot,
  .bp-empty,
  .bp-text-button {
    font-family: var(--bp-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--bp-dim);
  }
  .bp-panel-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .bp-text-button:hover {
    color: var(--bp-ink);
  }
  .bp-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .bp-chip {
    position: relative;
    max-width: 100%;
    overflow: hidden;
    padding: 5px 11px;
    border: 1px solid var(--bp-faint) !important;
    font-size: 13px;
    white-space: nowrap;
    text-overflow: ellipsis;
    user-select: none;
    touch-action: none;
    animation: bp-chip-in 0.36s var(--bp-spring) both;
    animation-delay: calc(var(--i) * 16ms);
    transition: border-color 0.15s ease-out, background-color 0.15s ease-out;
    &:hover,
    &.active,
    &.holding {
      border-color: var(--bp-ink) !important;
      background-color: var(--bp-hover);
    }
    // 长按进度: 底部墨线生长
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 2px;
      background-color: var(--bp-ink);
      transform: scaleX(0);
      transform-origin: left center;
      transition: transform 0.18s ease-out;
    }
    &.holding::after {
      transform: scaleX(1);
      transition: transform 0.55s cubic-bezier(0.4, 0, 0.6, 1);
    }
    &.removing {
      pointer-events: none;
      animation: bp-chip-out 0.2s var(--bp-exit) forwards;
    }
  }
  .bp-hit {
    text-decoration: underline 2px var(--bp-accent);
    text-underline-offset: 3px;
  }
  // 退场动画由 .removing 播放, 移除时不再走过渡, 避免已淡出的标签闪回
  .bp-chip-leave-active {
    display: none;
    animation: none !important;
    transition: none !important;
  }
  // 删除后其余标签弹性补位
  .bp-chip-move {
    transition: transform 0.34s var(--bp-spring);
  }
  .bp-empty {
    padding: 4px 0;
  }
  .bp-panel-foot {
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid var(--bp-line-major);
    opacity: 0.8;
  }

  @media (prefers-reduced-motion: reduce) {
    .bp-chip {
      animation: none !important;
    }
    .bp-chip-move,
    .bp-panel-enter-active {
      transition: none;
    }
  }
}

@keyframes bp-chip-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
}
@keyframes bp-chip-out {
  to {
    opacity: 0;
    transform: scale(0.86);
  }
}
</style>
