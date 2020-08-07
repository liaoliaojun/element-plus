import { nextTick, reactive, ref, watch } from 'vue'
import { merge } from 'lodash-es'
import type { SetupContext } from 'vue'
import type { Placement, Options as PopperOptions } from '@popperjs/core'

import { createPopper as PopperJS} from '@popperjs/core'
import isServer from '@element-plus/utils/isServer'
import { on, off } from '@element-plus/utils/dom'
import PopupManager from '@element-plus/utils/popup-manager'


interface IPopperSetupOptions extends IPopperOptions {
  appendToBody: boolean
  boundariesPadding: number
  disabled: boolean
  popper: Nullable<HTMLElement>
  popperOptions?: PopperOptions
  reference: Nullable<HTMLElement>
  transformOrigin: boolean | string
  value: boolean
  visibleArrow: boolean
}

interface IPopperOptions {
  gpuAcceleration?: boolean
  placement?: Placement
  offset?: number
  arrowOffset?: number
  boundariesPadding?: number
  onUpdate?: () => void
}

const defaultOptions: IPopperSetupOptions = {
  appendToBody: true,
  arrowOffset: 35,
  boundariesPadding: 5,
  disabled: false,
  offset: 0,
  placement: 'top',
  popper: null,
  reference: null,
  transformOrigin: true,
  value: false,
  visibleArrow: true,
}

const PlacementMap = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

function translateOptions<T = Partial<PopperOptions>>(opts: T, userProvided: T): T {
  return {
    ...opts,
    ...userProvided,
  }
}

export default function usePopper(props: IPopperSetupOptions, { emit, slots }: SetupContext) {

  // const props = reactive({
  //   ...defaultOptions,
  //   ...opt,
  // })
  const state = reactive({
    showPopper: false,
    currentPlacement: '' as Placement,
    popperJS: null,
    appended: false,
  })

  const popperElm = ref(null)
  const referenceElm = ref(null)
  const popperRef = ref(null)
  const referenceRef = ref(null)
  const arrowRef = ref(null)

  function resetTransformOrigin() {
    if (!props.transformOrigin) return

    const placement = state.popperJS._popper
      .getAttribute('x-placement')
      .split('-')[0]
    const origin = PlacementMap[placement]
    state.popperJS._popper.style.transformOrigin =
      typeof props.transformOrigin === 'string'
        ? props.transformOrigin
        : ['top', 'bottom'].indexOf(placement) > -1
          ? `center ${origin}`
          : `${origin} center`
  }

  function appendArrow(element: HTMLElement) {
    let hash
    if (state.appended) {
      return
    }

    state.appended = true

    for (const item in element.attributes) {
      if (/^_v-/.test(element.attributes[item].name)) {
        hash = element.attributes[item].name
        break
      }
    }

    const arrow = document.createElement('div')

    if (hash) {
      arrow.setAttribute(hash, '')
    }
    arrow.setAttribute('data-popper-arrow', '')
    arrow.className = 'popper__arrow'
    element.appendChild(arrow)
    arrowRef.value = arrow
  }

  function createPopper() {
    if (isServer) return
    state.currentPlacement = state.currentPlacement || props.placement
    if (
      !/^(top|bottom|left|right)(-start|-end)?$/g.test(state.currentPlacement)
    ) {
      return
    }

    const options = translateOptions({
      placement: state.currentPlacement,
      strategy: 'fixed',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: props.offset,
          },
        },
        {
          name: 'arrow',
          options: {
            element: arrowRef.value,
            centerOffset: props.arrowOffset,
          },
        },
        {
          name: 'eventListeners',
          options: {
            scroll: true,
            resize: true,
          },
        },
      ],
    }, props.popperOptions)
    const popper = (popperElm.value = popperElm.value || popperRef.value)
    let reference = (referenceElm.value =
      referenceElm.value || referenceRef.value)

    if (!reference && slots.reference && slots.reference[0]) {
      reference = referenceElm.value = slots.reference()[0].el
    }

    if (!popper || !reference) return
    if (props.visibleArrow) appendArrow(popper)
    if (props.appendToBody) document.body.appendChild(popperElm)

    state.popperJS?.value?.destroy()

    state.popperJS = PopperJS(reference, popper, options)
    state.popperJS.onCreate(() => {
      emit('created', this)
      resetTransformOrigin()
      nextTick(updatePopper)
    })
    if (typeof options.onUpdate === 'function') {
      state.popperJS.onUpdate(options.onUpdate)
    }
    state.popperJS._popper.style.zIndex = PopupManager.nextZIndex()
    on(popperElm.value, 'click', stop)
  }

  function updatePopper() {
    const _popperJS = state.popperJS
    if (_popperJS) {
      _popperJS.update()
      if (_popperJS._popper) {
        _popperJS._popper.style.zIndex = PopupManager.nextZIndex()
      }
    } else {
      createPopper()
    }
  }

  function destroyPopper() {
    if (state.popperJS) {
      resetTransformOrigin()
    }
  }

  function beforeDestroy() {
    doDestroy(true)
    if (popperElm.value && popperElm.value.parentNode === document.body) {
      off(popperElm.value, 'click', stop)
      document.body.removeChild(popperElm.value)
    }
  }

  function doDestroy(forceDestroy) {
    /* istanbul ignore if */
    if (!state.popperJS || (state.showPopper && !forceDestroy)) return
    state.popperJS.destroy()
    state.popperJS = null
  }

  watch(
    () => props.value,
    (val) => {
      state.showPopper = val
      emit('input', val)
    },
    { immediate: true },
  )

  watch(
    () => state.showPopper,
    (val) => {
      if (props.disabled) return
      val ? updatePopper() : destroyPopper()
      emit('input', val)
    },
  )

  return {
    beforeDestroy,
    currentPlacement: state.currentPlacement,
    popperElm,
    popperRef,
    referenceElm,
    referenceRef,
    showPopper: state.showPopper,
  }
}
