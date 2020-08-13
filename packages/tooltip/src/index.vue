<template>
  <slot></slot>
  <el-popper :referrer="referrer" :placement="placement">
    <slot name="content">
      {{ content }}
    </slot>
  </el-popper>
</template>
<script lang='ts'>
import { defineComponent, ref } from 'vue'
import type { PropType } from 'vue'
import { Placement, Options } from '@popperjs/core'

import ElPopper from '@element-plus/popper'
import isServer from '@element-plus/utils/isServer'

export default defineComponent({
  name: 'ElTooltip',
  components: {
    ElPopper,
  },
  props: {
    arrowOffset: {
      type: Number,
      default: 15,
    },
    // indicates should the popover gets cut off from it's boundary
    // true the popper would be partially unseenable if there weren't sufficient space 
    cutoff: {
      type: Boolean,
      default: false,
    },
    flip: {
      type: Boolean,
      default: true,
    },
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
      type: Object as PropType<Partial<Options>>,
      default: () => null,
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
    placement: {
      type: String as PropType<Placement>,
      default: 'bottom' as Placement,
      validator: (val: Placement) => {
        return /^(top|bottom|left|right)(-start|-end)?$/g.test(val)
      },
    },
    // indicates how should the popper over flow it's boundary
    /**
     * +-------------------------+
     * |                         |
     * |        Boundary         | ******|<-- boundray padding | popper
     * +------------------------ + ******|                     |
     */
    boundariesPadding: {
      type: Number,
      default: 0,
    },
    offset: {
      type: Number,
      default: 12,
    },
    value: {
      type: Boolean,
      default: false,
    },
    appendToBody: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, ctx) {
    if (isServer) return null
    // const popper = usePopper(props, ctx)
    return {
      referrer: ref(null),
    }
    // init here
  },
  mounted() {
    // console.log(this.showPopper)
    // this.showPopper = true
    this.referrer = this.$el.nextElementSibling
    // if (this.referenceRef) {
    //   this.referenceRef.setAttribute('aria-describedby', this.tooltipId)
    //   this.referenceRef.setAttribute('tabindex', this.tabindex)
    //   on(this.referenceRef, 'mouseenter', this.show)
    //   on(this.referenceRef, 'mouseleave', this.hide)
    //   on(this.referenceRef, 'focus', () => {
    //     // console.log(defaultSlots[0])
    //     const defaultSlots = this.$slots.default()
    //     console.log(defaultSlots)

    //     if (!defaultSlots || defaultSlots.length === 0) {
    //       this.handleFocus()
    //       return
    //     }
    //     const instance = defaultSlots[0].componentInstance
    //     if (instance && instance.focus) {
    //       instance.focus()
    //     } else {
    //       this.handleFocus()
    //     }
    //   })
    //   on(this.referenceRef, 'blur', this.handleBlur)
    //   on(this.referenceRef, 'click', this.removeFocusing)
    // }
    // // fix issue https://github.com/ElemeFE/element/issues/14424
    // if (this.value) {
    //   nextTick(() => {
    //     if (this.value) {
    //       this.updatePopper()
    //     }
    //   })
    // }
    // this.debounceClose = debounce(
    //   () => {
    //     this.handleClosePopper()
    //   },
    //   200)
  },
  deactivated() {
    this.beforeDestroy()
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
      if ((this.enterable && this.expectedState) || this.manual) return
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
    onMouseEnter() {
      this.setExpectedState(true)
    },
    onMouseLeave() {
      this.setExpectedState(false)
      this.debounceClose()
    },
  },
})
</script>