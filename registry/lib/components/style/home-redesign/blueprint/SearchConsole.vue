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
    <SearchBox
      class="bp-in"
      style="--bp-delay: 75ms; --bp-panel-offset: 36px"
      size="hero"
      shortcut
    />
    <div class="bp-meta bp-in" style="--bp-delay: 110ms">
      <span class="bp-ruler" aria-hidden="true"></span>
      <span>{{ clock }}</span>
    </div>
  </div>
</template>
<script lang="ts">
import SearchBox from '../../blueprint-shared/SearchBox.vue'

const pad = (value: number) => value.toString().padStart(2, '0')
const formatClock = (date: Date) =>
  `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}  ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`

export default Vue.extend({
  components: {
    SearchBox,
  },
  data() {
    return {
      clock: formatClock(new Date()),
      clockTimer: 0,
    }
  },
  mounted() {
    this.clockTimer = window.setInterval(() => {
      this.clock = formatClock(new Date())
    }, 1000)
  },
  beforeDestroy() {
    window.clearInterval(this.clockTimer)
  },
})
</script>
