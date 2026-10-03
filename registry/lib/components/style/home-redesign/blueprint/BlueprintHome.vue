<template>
  <div class="bp-root">
    <div class="bp-watermark" aria-hidden="true">
      <VIcon icon="logo" :size="380" />
    </div>
    <BlueprintHeader class="bp-in" style="--bp-delay: 0ms" />
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
import BlueprintHeader from './BlueprintHeader.vue'
import SearchConsole from './SearchConsole.vue'

export default Vue.extend({
  components: {
    VIcon,
    BlueprintHeader,
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
.bp-root {
  // 纸面 (浅色) / 底片 (深色), 跟随系统外观
  --bp-bg: #f2f2ef;
  --bp-surface: #f7f7f4;
  --bp-ink: #161616;
  --bp-dim: #6e6e6b;
  --bp-faint: #c2c2bc;
  --bp-line: rgba(0, 0, 0, 0.045);
  --bp-line-major: rgba(0, 0, 0, 0.085);
  --bp-watermark: rgba(0, 0, 0, 0.022);
  --bp-border: #8f8f8a;
  --bp-hover: rgba(0, 0, 0, 0.045);
  --bp-accent: #002fa7;
  --bp-sans: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
  --bp-mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  --bp-gutter: 32px;
  --bp-spring: cubic-bezier(0.34, 1.32, 0.64, 1);
  --bp-exit: cubic-bezier(0.4, 0, 1, 1);

  @media (prefers-color-scheme: dark) {
    --bp-bg: #070707;
    --bp-surface: #0b0b0b;
    --bp-ink: #e6e6e6;
    --bp-dim: #707070;
    --bp-faint: #353535;
    --bp-line: rgba(255, 255, 255, 0.045);
    --bp-line-major: rgba(255, 255, 255, 0.085);
    --bp-watermark: rgba(255, 255, 255, 0.028);
    --bp-border: #8a8a8a;
    --bp-hover: rgba(255, 255, 255, 0.06);
  }

  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--bp-ink);
  font-family: var(--bp-sans);
  font-size: 14px;
  line-height: 1.5;
  background-color: var(--bp-bg);
  background-image: linear-gradient(var(--bp-line-major) 1px, transparent 1px),
    linear-gradient(90deg, var(--bp-line-major) 1px, transparent 1px),
    linear-gradient(var(--bp-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--bp-line) 1px, transparent 1px);
  background-size: 120px 120px, 120px 120px, 24px 24px, 24px 24px;
  background-position: center center;
  -webkit-font-smoothing: antialiased;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  button {
    font: inherit;
    color: inherit;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  :focus-visible {
    outline: 1px solid var(--bp-accent);
    outline-offset: 2px;
  }

  // ---------- 骨架 ----------
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

  // ---------- 顶栏 ----------
  .bp-head {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 0 var(--bp-gutter);
  }
  .bp-logo {
    display: flex;
    color: var(--bp-ink);
    // logo 字形宽约为字号的 2.2 倍, 图标框改为随字形自适应, 否则会溢出边距
    .be-icon {
      width: auto !important;
    }
    transition: opacity 0.2s ease-out;
    &:hover {
      opacity: 0.7;
    }
  }
  .bp-nav {
    display: flex;
    align-items: center;
    gap: 24px;
  }
  .bp-nav-link {
    font-size: 14px;
    color: var(--bp-dim);
    transition: color 0.15s ease-out;
    &:hover {
      color: var(--bp-ink);
    }
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
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: block;
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
  .bp-login {
    font-family: var(--bp-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--bp-dim);
    &:hover {
      color: var(--bp-ink);
    }
  }
  .bp-menu {
    position: absolute;
    top: calc(100% + 14px);
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
      color: var(--bp-ink);
      overflow: hidden;
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
  .bp-menu-count {
    min-width: 18px;
    padding: 0 5px;
    font-family: var(--bp-mono);
    font-size: 11px;
    line-height: 16px;
    text-align: center;
    color: #fff;
    background-color: var(--bp-accent);
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

  // ---------- 搜索控制台 ----------
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
  .bp-meta,
  .bp-panel-head,
  .bp-panel-foot,
  .bp-empty,
  .bp-text-button {
    font-family: var(--bp-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--bp-dim);
  }
  .bp-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    white-space: pre;
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

  // 斜切角用伪元素绘制
  .bp-field {
    --bp-chamfer: 12px;
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
  .bp-input {
    flex: 1;
    min-width: 0;
    height: 48px;
    padding: 0 16px;
    border: none;
    outline: none !important;
    background: transparent;
    color: var(--bp-ink);
    font: 16px var(--bp-sans);
    caret-color: var(--bp-accent);
    &::placeholder {
      color: var(--bp-dim);
    }
  }
  .bp-submit {
    display: flex;
    padding: 0 16px;
    height: 48px;
    align-items: center;
    color: var(--bp-dim);
    transition: color 0.15s ease-out;
    &:hover {
      color: var(--bp-ink);
    }
  }

  // ---------- 候选面板 ----------
  .bp-panel {
    position: absolute;
    top: calc(100% - 18px);
    left: 32px;
    right: 32px;
    z-index: 1;
    border: 1px solid var(--bp-faint);
    background-color: var(--bp-surface);
    padding: 12px 14px 14px;
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

  // ---------- 进场 ----------
  .bp-in {
    animation: bp-enter 0.52s var(--bp-spring) both;
    animation-delay: var(--bp-delay, 0ms);
  }

  @media (prefers-reduced-motion: reduce) {
    .bp-in,
    .bp-chip {
      animation: none !important;
    }
    .bp-chip-move,
    .bp-panel-enter-active,
    .bp-menu-enter-active {
      transition: none;
    }
  }
}

@keyframes bp-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
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
