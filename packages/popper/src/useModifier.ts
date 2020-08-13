import { isArray } from '@vue/shared'

import type { Ref } from 'vue'

type NullableRef<T> = Ref<Nullable<T>>
// type ElementRef = NullableRef<HTMLElement>

// export default function usePopper(props: IPopperSetupOptions, { emit }: SetupContext) {

//   const _popper: NullableRef<PopperInstance> = ref(null)
//   // TODO: change show popper to false
//   const showPopper = ref(false)
//   const popperRef: ElementRef = ref(null)
//   const referenceRef: ElementRef = ref(null)
//   const arrowRef: ElementRef = ref(null)

//   function createPopper() {
//     if (isServer) return

//     const popper = popperRef.value
//     const reference = referenceRef.value
//     if (!popper || !reference) return
//     console.log(props.offset)
//     let popperOptions: Options
//     if (props.popperOptions === null) {
 

//       const modifiers = [
//         offsetModifier,
//         preventOverflowModifier,
//         arrowModifier,
//         flipModifier,
//       ]

//       popperOptions = {
//         placement: props.placement,
//         strategy: 'absolute',
//         onFirstUpdate: () => {
//           nextTick(updatePopper)
//           popper.style.zIndex = String(PopupManager.nextZIndex())
//         },
//         modifiers,
//       }
//     } else {
//       popperOptions = props.popperOptions
//     }

//     console.log(popperOptions)

//     _popper.value = PopperJS(reference, popper, popperOptions)
//     on(popper, 'click', stop)
//   }

//   function updatePopper() {
//     const _popperJS = _popper.value
//     if (_popperJS) {
//       _popperJS.update()
//     } else {
//       createPopper()
//     }
//   }

//   function beforeDestroy() {
//     doDestroy(true)
//     if (popperRef.value && popperRef.value.parentNode === document.body) {
//       off(popperRef.value, 'click', stop)
//       document.body.removeChild(popperRef.value)
//     }
//   }

//   function doDestroy(forceDestroy: boolean) {
//     /* istanbul ignore if */
//     if (!_popper.value || (showPopper.value && !forceDestroy)) return
//     _popper.value.destroy()
//     _popper.value = null
//   }

//   watch(
//     () => props.value,
//     (val) => {
//       showPopper.value = val
//       emit('input', val)
//     },
//     { immediate: true },
//   )

//   watch(
//     () => showPopper.value,
//     (val) => {
//       if (props.disabled) return
//       if (_popper.value) {
//         if (val) updatePopper()
//         return
//       }
//       val ? updatePopper() : beforeDestroy()
//       emit('input', val)
//     },
//   )

//   watch(
//     () => props.disabled,
//     (val) => {
//       val ? beforeDestroy() : updatePopper()
//     },
//   )

//   return {
//     beforeDestroy,
//     doDestroy,
//     arrowRef,
//     popperRef,
//     referenceRef,
//     showPopper,
//   }
// }

interface IBuildModifierOptions {
  arrowOffset: number
  arrowRef: HTMLElement
  boundariesPadding: number
  cutoff: boolean
  offset: [number, number] | number
  showArrow: boolean
  fallbackOptions: Record<string, unknown>
}
export default (options: IBuildModifierOptions) => {
  const offset = isArray(options.offset) ? options.offset.slice(0, 2) : [0, options.offset]
  const modifiers = [
    {
      name: 'offset',
      options: {
        offset,
      },
    },
    {
      name: 'preventOverflow',
      options: {
        padding: options.boundariesPadding,
        altBoundary: true,
        tether: options.cutoff,
      },
    },
    {
      name: 'arrow',
      options: {
        element: options.arrowRef,
        padding: options.arrowOffset,
      },
    },
    {
      name: 'flip',
      options: options.fallbackOptions,
    },
  ]

  return modifiers
}
