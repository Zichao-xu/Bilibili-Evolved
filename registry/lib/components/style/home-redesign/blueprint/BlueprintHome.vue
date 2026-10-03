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

.blueprint-home {
  --bp-ink: #e6e6e6;
  --bp-dim: #6b6b6b;
  --bp-faint: #3a3a3a;
  --bp-line: rgba(255, 255, 255, 0.045);
  --bp-line-major: rgba(255, 255, 255, 0.085);
  --bp-accent: #002fa7;
  --bp-mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  --bp-chamfer: 12px;

  position: relative;
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: var(--bp-ink);
  background-color: #070707;
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
    color: rgba(255, 255, 255, 0.028);
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
    background-position: left top, left top;
  }

  // 切角用伪元素画, 不用 clip-path, 否则会把下拉建议列表一起裁掉
  .bp-field {
    --bp-border: #8a8a8a;
    position: relative;
    border: 1px solid var(--bp-border);
    background-color: #070707;
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
        #070707 calc(50% - 0.6px),
        var(--bp-border) calc(50% - 0.6px),
        var(--bp-border) calc(50% + 0.6px),
        transparent calc(50% + 0.6px)
      );
      transition: background 0.2s ease-out;
    }
    &:focus-within {
      --bp-border: var(--bp-ink);
      border-color: var(--bp-border);
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

  .launch-bar-suggest-list {
    // 让出下方刻度尺与时钟那一行
    top: calc(100% + 36px);
    border-radius: 0;
    border: 1px solid var(--bp-faint);
    box-shadow: none;
    color: var(--bp-ink);
    background-color: #0b0b0b;
    font-size: 13px;
    .suggest-highlight {
      color: #fff;
      text-decoration: underline 2px var(--bp-accent);
      text-underline-offset: 3px;
    }
    .be-launch-bar-suggest-item:not(.disabled).focused,
    .be-launch-bar-suggest-item:not(.disabled):hover {
      background-color: rgba(255, 255, 255, 0.06);
    }
  }

  .bp-sheet {
    position: absolute;
    left: 32px;
    right: 32px;
    bottom: 24px;
    color: #4d4d4d;
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
