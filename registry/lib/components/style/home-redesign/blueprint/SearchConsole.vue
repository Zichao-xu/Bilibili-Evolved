<template>
  <div class="bp-console">
    <i class="bp-crop tl" aria-hidden="true"></i>
    <i class="bp-crop tr" aria-hidden="true"></i>
    <i class="bp-crop bl" aria-hidden="true"></i>
    <i class="bp-crop br" aria-hidden="true"></i>
    <div class="bp-meta bp-in" style="--bp-delay: 40ms">
      <span><b class="bp-mark"></b>01 — QUERY</span>
      <span>/ FOCUS · ↵ SEARCH</span>
    </div>
    <form class="bp-field bp-in" style="--bp-delay: 75ms" role="search" @submit.prevent="submit">
      <input
        ref="input"
        v-model="query"
        class="bp-input"
        type="text"
        role="combobox"
        autocomplete="off"
        spellcheck="false"
        placeholder="搜索视频、番剧、UP 主"
        aria-label="搜索"
        :aria-expanded="panelOpen"
        aria-controls="bp-chips"
        @focus="onFocus"
        @blur="focused = false"
        @keydown="onKeydown"
      />
      <button class="bp-submit" type="submit" aria-label="搜索">
        <VIcon icon="right-arrow" :size="18" />
      </button>
    </form>
    <div class="bp-meta bp-in" style="--bp-delay: 110ms">
      <span class="bp-ruler" aria-hidden="true"></span>
      <span>{{ clock }}</span>
    </div>

    <transition name="bp-panel">
      <div v-if="panelOpen" class="bp-panel" @pointerdown.prevent>
        <div class="bp-panel-head">
          <span>02 — {{ mode === 'history' ? 'HISTORY' : 'SUGGEST' }}</span>
          <button
            v-if="mode === 'history' && chips.length > 0"
            class="bp-text-button"
            type="button"
            @click="clearAll"
          >
            CLEAR ALL
          </button>
        </div>
        <transition-group id="bp-chips" tag="div" name="bp-chip" class="bp-chips" role="listbox">
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

const pad = (value: number) => value.toString().padStart(2, '0')
const formatClock = (date: Date) =>
  `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}  ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`

export default Vue.extend({
  components: {
    VIcon,
  },
  data() {
    return {
      query: '',
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
      clock: formatClock(new Date()),
      clockTimer: 0,
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
    panelOpen(): boolean {
      return this.focused
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
    this.clockTimer = window.setInterval(() => {
      this.clock = formatClock(new Date())
    }, 1000)
    document.addEventListener('keydown', this.onGlobalKeydown)
  },
  beforeDestroy() {
    window.clearInterval(this.clockTimer)
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
