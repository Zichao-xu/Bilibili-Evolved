<template>
  <HomeRedesignBase>
    <div class="blueprint-home">
      <div class="bp-watermark" aria-hidden="true">
        <VIcon icon="logo" :size="380" />
      </div>
      <div class="bp-block">
        <i class="bp-crop tl" aria-hidden="true"></i>
        <i class="bp-crop tr" aria-hidden="true"></i>
        <i class="bp-crop bl" aria-hidden="true"></i>
        <i class="bp-crop br" aria-hidden="true"></i>
        <div class="bp-meta bp-in" style="--bp-delay: 0ms">
          <span><b class="bp-mark"></b>01 — QUERY</span>
          <span>ENTER ↵</span>
        </div>
        <div class="bp-field bp-in" style="--bp-delay: 35ms">
          <LaunchBar />
        </div>
        <div class="bp-meta bp-in" style="--bp-delay: 70ms">
          <span class="bp-ruler" aria-hidden="true"></span>
          <span>{{ clock }}</span>
        </div>
      </div>
      <div class="bp-sheet bp-in" style="--bp-delay: 105ms">
        <span>BILIBILI / SEARCH — SHEET 01</span>
        <span>REV. {{ revision }}</span>
      </div>
    </div>
  </HomeRedesignBase>
</template>
<script lang="ts">
import LaunchBar from '@/components/launch-bar/LaunchBar.vue'
import { VIcon } from '@/ui'
import HomeRedesignBase from '../HomeRedesignBase.vue'

const pad = (value: number) => value.toString().padStart(2, '0')
const formatClock = (date: Date) =>
  `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}  ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`

export default Vue.extend({
  components: {
    HomeRedesignBase,
    LaunchBar,
    VIcon,
  },
  data() {
    const now = new Date()
    return {
      clock: formatClock(now),
      revision: `${now.getFullYear()}.${pad(now.getMonth() + 1)}`,
      timer: 0,
    }
  },
  mounted() {
    this.timer = window.setInterval(() => {
      this.clock = formatClock(new Date())
    }, 1000)
  },
  beforeDestroy() {
    window.clearInterval(this.timer)
  },
})
</script>
<style lang="scss">
@import 'common';

html:has(body:not(.home-redesign-off) .blueprint-home),
body:not(.home-redesign-off):has(.blueprint-home) {
  height: 100%;
  overflow: hidden;
}

.home-redesign-base:has(.blueprint-home) {
  position: fixed;
  inset: 0;
  z-index: 0;
  width: 100%;
  min-height: 0 !important;
  background-color: transparent !important;
  @include v-stretch();
}

// 配色变量定义在 blueprint-chrome.scss, 跟随系统深浅色
.blueprint-home {
  --bp-chamfer: 12px;

  position: relative;
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: var(--bp-ink);
  background-color: var(--bp-bg);
  background-image: linear-gradient(var(--bp-line-major) 1px, transparent 1px),
    linear-gradient(90deg, var(--bp-line-major) 1px, transparent 1px),
    linear-gradient(var(--bp-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--bp-line) 1px, transparent 1px);
  background-size: 120px 120px, 120px 120px, 24px 24px, 24px 24px;
  background-position: center center;
  @include v-center();
  justify-content: center;

  .bp-watermark {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -54%);
    color: var(--bp-watermark);
    pointer-events: none;
    user-select: none;
  }

  .bp-block {
    position: relative;
    width: min(640px, 88vw);
    padding: 28px 32px;
    @include v-stretch();
    gap: 10px;
  }

  .bp-crop {
    position: absolute;
    width: 14px;
    height: 14px;
    border-color: var(--bp-faint);
    border-style: solid;
    border-width: 0;
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
  .bp-sheet {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: var(--bp-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--bp-dim);
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

  // 切角用伪元素画, 不用 clip-path, 否则会把下拉建议一起裁掉
  .bp-field {
    --bp-field-border: var(--bp-border);
    position: relative;
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

    .launch-bar {
      --color: var(--bp-ink);
      font-size: 16px;
      padding: 10px 14px;

      .input-area .launch-bar-form .input {
        width: 100%;
        caret-color: var(--bp-accent);
        &::placeholder {
          color: var(--bp-dim) !important;
        }
      }
      .submit {
        color: var(--bp-dim);
      }
    }
  }

  // 候选词 / 搜索历史: 标签块平铺, 去掉逐行重复的图标
  .launch-bar-suggest-list {
    // 让出下方刻度尺与时钟那一行
    top: calc(100% + 36px);
    border-radius: 0;
    border: 1px solid var(--bp-faint);
    box-shadow: none;
    color: var(--bp-ink);
    background-color: var(--bp-bg);
    white-space: normal;
    font-size: 13px;

    .launch-bar-history-list,
    .launch-bar-action-list {
      position: relative;
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
      gap: 8px;
      padding: 38px 14px 14px;
      &::before {
        position: absolute;
        top: 14px;
        left: 14px;
        font-family: var(--bp-mono);
        font-size: 11px;
        letter-spacing: 0.08em;
        color: var(--bp-dim);
      }
    }
    .launch-bar-history-list::before {
      content: '02 — HISTORY';
    }
    .launch-bar-action-list::before {
      content: '02 — SUGGEST';
    }

    .be-launch-bar-suggest-item {
      position: relative;
      max-width: 100%;
      padding: 6px 11px !important;
      border: 1px solid var(--bp-faint);
      border-radius: 0 !important;
      transition: border-color 0.15s ease-out, background-color 0.15s ease-out;
      &-content {
        gap: 0;
      }
      &-icon,
      &-description {
        display: none;
      }
      &-title {
        flex: none;
        width: auto;
      }
      &-delete {
        position: absolute;
        top: -7px;
        right: -7px;
        width: 14px;
        height: 14px;
        margin: 0;
        @include h-center();
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s ease-out;
        justify-content: center;
        color: var(--bp-bg);
        background-color: var(--bp-dim);
        .be-icon {
          font-size: 10px !important;
          width: 10px !important;
          height: 10px !important;
        }
        &:hover {
          background-color: var(--bp-ink);
        }
      }
      &:not(.disabled):hover,
      &:not(.disabled).focused,
      &:not(.disabled):focus-within {
        border-color: var(--bp-ink);
        background-color: var(--bp-hover);
      }
      &:hover .be-launch-bar-suggest-item-delete {
        opacity: 1;
        pointer-events: initial;
      }
      &.disabled {
        border: none;
        padding: 0 !important;
        color: var(--bp-dim);
      }
    }

    // 历史列表最后一项是「清除搜索历史」, 放到标题行右侧
    .launch-bar-history-list .be-launch-bar-suggest-item:last-child:not(.disabled) {
      position: absolute;
      top: 10px;
      right: 14px;
      padding: 2px 0 !important;
      border: none;
      background: none !important;
      color: var(--bp-dim);
      font-family: var(--bp-mono);
      font-size: 11px;
      letter-spacing: 0.08em;
      .be-launch-bar-suggest-item-name {
        font-size: 0;
        &::after {
          content: 'CLEAR ×';
          font-size: 11px;
        }
      }
      &:hover {
        color: var(--bp-ink);
      }
    }

    .suggest-highlight {
      color: inherit;
      text-decoration: underline 2px var(--bp-accent);
      text-underline-offset: 3px;
    }
  }

  .bp-sheet {
    position: absolute;
    left: var(--bp-gutter);
    right: var(--bp-gutter);
    bottom: 24px;
    color: var(--bp-dim);
    opacity: 0.7;
  }

  .bp-in {
    animation: bp-enter 0.52s cubic-bezier(0.34, 1.32, 0.64, 1) both;
    animation-delay: var(--bp-delay, 0ms);
  }

  @media (prefers-reduced-motion: reduce) {
    .bp-in {
      animation: none;
    }
  }
}

@keyframes bp-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
