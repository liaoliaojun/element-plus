<template>
  <div>
    <slot></slot>
  </div>
</template>
<script lang="ts">
import { defineComponent, nextTick, reactive, ref, watch } from 'vue'
import type { PropType } from 'vue'

import * as PopperJS from '@popperjs/core'
import isServer from '@element-plus/utils/isServer'
import { on, off } from '@element-plus/utils/dom'
import PopupManager from '@element-plus/utils/popup-manager'

const stop = (e: Event) => e.stopPropagation()

export default defineComponent({
  name: 'ElPopper',
  props: {

  },
  emits: ['input', 'created'],
  setup(props, { emit, slots }) {
    // init here

  },
  deactivated() {
    this.$options.beforeDestroy[0].call(this)
  },
})
</script>
<style scoped></style>
