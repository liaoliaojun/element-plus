<template>
  <div>
    <slot></slot>
  </div>
</template>
<script lang='ts'>
import { defineComponent, h, ref, watch, nextTick } from 'vue'
import type { PropType } from 'vue'
import PopperJS from '@popperjs/core'
import isServer from '@element-plus/utils/isServer'
import { on } from '@element-plus/utils/dom'
import PopupManager from '@element-plus/utils/popup-manager'


const stop = (e: Event) => e.stopPropagation()

export default defineComponent({
  name: 'ElPopper',
  props: {
    transformOrigin: {
      type: [Boolean, String],
      default: true,
    },
    placement: {
      type: String,
      default: 'bottom',
    },
    boundariesPadding: {
      type: Number,
      default: 5,
    },
    reference: {
      type: Object as PropType<Nullable<HTMLElement>>,
      default: () => null,
    },
    popper: {
      type: Object as PropType<Nullable<HTMLElement>>,
      default: () => null,
    },
    offset: {
      type: Number,
      default: 0,
    },
    value: { type: Boolean, default: false },
    visibleArrow: { type: Boolean, default: true },
    arrowOffset: {
      type: Number,
      default: 35,
    },
    appendToBody: {
      type: Boolean,
      default: true,
    },
    popperOptions: {
      type: Object,
      default() {
        return {
          gpuAcceleration: false,
        }
      },
    },


  },
  emits: ['input', 'created'],
  setup(props, { emit, slots  }) {
    // init here
    const showPopper = ref(false)
    const currentPlacement = ref('')
    const popperJS = ref(null)
    const popperElm = ref(null)
    const referenceElm = ref(null)
    const popperRef = ref(null)
    const referenceRef = ref(null)
    const appended = ref(false)

    const resetTransformOrigin = () => {
      if (!props.transformOrigin) return
      let placementMap = {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left',
      }
      let placement = popperJS.value._popper.getAttribute('x-placement').split('-')[0]
      let origin = placementMap[placement]
      popperJS.value._popper.style.transformOrigin = typeof props.transformOrigin === 'string'
        ? props.transformOrigin
        : ['top', 'bottom'].indexOf(placement) > -1 ? `center ${ origin }` : `${ origin } center`
    }

    const appendArrow = (element: HTMLElement) => {
      let hash
      if (appended.value) {
        return
      }

      appended.value = true

      for (let item in element.attributes) {
        if (/^_v-/.test(element.attributes[item].name)) {
          hash = element.attributes[item].name
          break
        }
      }

      const arrow = document.createElement('div')

      if (hash) {
        arrow.setAttribute(hash, '')
      }
      arrow.setAttribute('x-arrow', '')
      arrow.className = 'popper__arrow'
      element.appendChild(arrow)
    }

    const createPopper = () => {
      if (isServer) return
      currentPlacement.value = currentPlacement.value || props.placement
      if (!/^(top|bottom|left|right)(-start|-end)?$/g.test(currentPlacement.value)) {
        return
      }

      const options = props.popperOptions
      const popper = popperElm.value = popperElm.value || popperRef.value
      let reference = referenceElm.value = referenceElm.value ||  referenceRef.value

      if (!reference &&
        slots.reference &&
        slots.reference[0]) {
        reference = referenceElm.value = slots.reference()[0].el
      }

      if (!popper || !reference) return
      if (props.visibleArrow) appendArrow(popper)
      if (props.appendToBody) document.body.appendChild(popperElm)

      popperJS?.value?.destroy()

      options.placement = currentPlacement.value
      options.offset = props.offset
      options.arrowOffset = props.arrowOffset
      popperJS.value = PopperJS.createPopper(reference, popper, options)
      popperJS.value.onCreate((_: void) => {
        emit('created', this)
        resetTransformOrigin()
        nextTick(updatePopper)
      })
      if (typeof options.onUpdate === 'function') {
        popperJS.value.onUpdate(options.onUpdate)
      }
      popperJS.value._popper.style.zIndex = PopupManager.nextZIndex()
      on(popperElm.value, 'click', stop)
    }

    function updatePopper() {
      const _popperJS = popperJS.value
      if (_popperJS) {
        _popperJS.update()
        if (_popperJS._popper) {
          _popperJS._popper.style.zIndex = PopupManager.nextZIndex()
        }
      } else {
        createPopper()
      }
    }

    const destroyPopper = () => {
      if (popperJS.value) {
        resetTransformOrigin()
      }
    }

    watch(() => props.value, (val) => {
      showPopper.value = val
      emit('input', val)
    }, { immediate: true })

    watch(() => showPopper, (val) => {
      if (props.disabled) return
      val ? updatePopper() : destroyPopper()
      emit('input', val)
    })
    return {
      showPopper,
      currentPlacement,
    }
  },
})
</script>
<style scoped>
</style>
