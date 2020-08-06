<template>
  <div>
    <slot></slot>
  </div>
</template>
<script lang='ts'>
import { defineComponent, ref, h } from 'vue'
import Popper from '@popperjs/core'
import isServer from '@element-plus/utils/isServer'
import { addClass, removeClass, on, off } from '@element-plus/utils/dom'
import { generateId } from '@element-plus/utils/util'
import { debounce } from 'lodash-es'

export default defineComponent({
  name: 'ElTooltip',
  props: {
    openDelay: {
      type: Number,
      default: 0,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    manual: {
      type: Boolean,
      default: false,
    },
    effect: {
      type: String,
      default: 'dark',
    },
    arrowOffset: {
      type: Number,
      default: 0,
    },
    popperClass: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    visibleArrow: {
      type: Boolean,
      default: true,
    },
    transition: {
      type: String,
      default: 'el-fade-in-linear',
    },
    popperOptions: {
      type: Object,
      default() {
        return {
          boundariesPadding: 10,
          gpuAcceleration: false,
        }
      },
    },
    enterable: {
      type: Boolean,
      default: true,
    },
    hideAfter: {
      type: Number,
      default: 0,
    },
    tabindex: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {

    if (isServer) return null

    // this.popperVM = new Vue({
    //   data: function() {
    //     return { node: '' }
    //   },
    //   render(h) {
    //     return this.node
    //   },
    // }).$mount()
    const tooltipId = ref(`el-tooltip-${generateId()}`)
    const timeoutPending = ref(null)
    const focusing = ref(false)
    const timeout = ref(null)
    const expectedState = ref(false)

    const doDestroy = () => {
    }

    const handleClosePopper = () => {
      if (props.enterable && expectedState || props.manual) return
      clearTimeout(timeout)

      if (timeoutPending.value) {
        clearTimeout(timeoutPending.value)
      }
      this.showPopper = false

      if (props.disabled) {
        doDestroy()
      }
    }
    const debounceClose = debounce(() => handleClosePopper(), 200)
    // init here
    return {
      debounceClose,
      doDestroy,
      expectedState,
      focusing,
      tooltipId,
      timeoutPending,
      timeout,
    }
  },
  methods: {
    show() {
      this.setExpectedState(true)
      this.handleShowPopper()
    },

    hide() {
      this.setExpectedState(false)
      this.debounceClose()
    },
    handleFocus() {
      this.focusing = true
      this.show()
    },
    handleBlur() {
      this.focusing = false
      this.hide()
    },
    removeFocusing() {
      this.focusing = false
    },

    addTooltipClass(prev) {
      if (!prev) {
        return 'el-tooltip'
      } else {
        return 'el-tooltip ' + prev.replace('el-tooltip', '')
      }
    },

    handleShowPopper() {
      if (!this.expectedState || this.manual) return
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.showPopper = true
      }, this.openDelay)

      if (this.hideAfter > 0) {
        this.timeoutPending = setTimeout(() => {
          this.showPopper = false
        }, this.hideAfter)
      }
    },

    handleClosePopper() {
      if (this.enterable && this.expectedState || this.manual) return
      clearTimeout(this.timeout)

      if (this.timeoutPending) {
        clearTimeout(this.timeoutPending)
      }
      this.showPopper = false

      if (this.disabled) {
        this.doDestroy()
      }
    },

    setExpectedState(expectedState) {
      if (expectedState === false) {
        clearTimeout(this.timeoutPending)
      }
      this.expectedState = expectedState
    },

    getFirstElement() {
      const slots = this.$slots.default
      if (!Array.isArray(slots)) return null
      let element = null
      for (let index = 0; index < slots.length; index++) {
        if (slots[index] && slots[index].tag) {
          element = slots[index]
        }
      }
      return element
    },
  },
})
</script>
<style scoped>
</style>
