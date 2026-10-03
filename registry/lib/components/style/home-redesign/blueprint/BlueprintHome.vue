<template>
  <div class="bp-root">
    <div class="bp-watermark" aria-hidden="true">
      <VIcon icon="logo" :size="380" />
    </div>
    <div class="bp-navbar-spacer" aria-hidden="true"></div>
    <main class="bp-main">
      <SearchConsole />
    </main>
    <footer class="bp-sheet bp-in" style="--bp-delay: 150ms">
      <span>BILIBILI / INDEX — SHEET 01</span>
      <span>REV. {{ revision }}</span>
    </footer>
  </div>
</template>
<script lang="ts">
import { VIcon } from '@/ui'
import SearchConsole from './SearchConsole.vue'

export default Vue.extend({
  components: {
    VIcon,
    SearchConsole,
  },
  data() {
    const now = new Date()
    return {
      revision: `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}`,
    }
  },
})
</script>
<style lang="scss">
@import '../../blueprint-shared/tokens';

// 配色与搜索框样式来自 blueprint-shared, 顶栏由「图纸顶栏」组件提供
.bp-root {
  @include tokens;
  @include reset;

  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bp-bg);
  background-image: linear-gradient(var(--bp-line-major) 1px, transparent 1px),
    linear-gradient(90deg, var(--bp-line-major) 1px, transparent 1px),
    linear-gradient(var(--bp-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--bp-line) 1px, transparent 1px);
  background-size: 120px 120px, 120px 120px, 24px 24px, 24px 24px;
  background-position: center center;

  .bp-navbar-spacer {
    flex: none;
    height: 64px;
  }
  .bp-watermark {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -54%);
    color: var(--bp-watermark);
    pointer-events: none;
    user-select: none;
  }
  .bp-main {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .bp-sheet {
    display: flex;
    justify-content: space-between;
    padding: 0 var(--bp-gutter) 24px;
    font-family: var(--bp-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--bp-dim);
  }

  // ---------- 搜索控制台的装饰 ----------
  .bp-console {
    position: relative;
    width: min(640px, calc(100vw - 2 * var(--bp-gutter)));
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .bp-crop {
    position: absolute;
    width: 14px;
    height: 14px;
    border: 0 solid var(--bp-faint);
    &.tl {
      top: 0;
      left: 0;
      border-top-width: 1px;
      border-left-width: 1px;
    }
    &.tr {
      top: 0;
      right: 0;
      border-top-width: 1px;
      border-right-width: 1px;
    }
    &.bl {
      bottom: 0;
      left: 0;
      border-bottom-width: 1px;
      border-left-width: 1px;
    }
    &.br {
      bottom: 0;
      right: 0;
      border-bottom-width: 1px;
      border-right-width: 1px;
    }
  }
  .bp-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    white-space: pre;
    font-family: var(--bp-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--bp-dim);
  }
  .bp-mark {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 8px;
    vertical-align: 1px;
    background-color: var(--bp-accent);
  }
  .bp-ruler {
    flex: 0 0 220px;
    height: 7px;
    background-image: linear-gradient(90deg, var(--bp-faint) 1px, transparent 1px),
      linear-gradient(90deg, var(--bp-dim) 1px, transparent 1px);
    background-size: 11px 4px, 55px 7px;
    background-repeat: repeat-x;
  }

  // ---------- 进场 ----------
  .bp-in {
    animation: bp-enter 0.52s var(--bp-spring) both;
    animation-delay: var(--bp-delay, 0ms);
  }
  @media (prefers-reduced-motion: reduce) {
    .bp-in {
      animation: none !important;
    }
  }
}

@keyframes bp-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}
</style>
