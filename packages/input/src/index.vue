<template>
  <div
    :class="[
      type === 'textarea' ? 'el-textarea' : 'el-input',
      inputSize ? 'el-input--' + inputSize : '',
      {
        'is-disabled': inputDisabled,
        'is-exceed': inputExceed,
        'el-input-group': $slots.prepend || $slots.append,
        'el-input-group--append': $slots.append,
        'el-input-group--prepend': $slots.prepend,
        'el-input--prefix': $slots.prefix || prefixIcon,
        'el-input--suffix': $slots.suffix || suffixIcon || clearable || showPassword
      }
    ]"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <template v-if="type !== 'textarea'">
      <!-- 前置元素 -->
      <div v-if="$slots.prepend" class="el-input-group__prepend">
        <slot name="prepend"></slot>
      </div>
      <!-- eslint-disable vue/html-self-closing -->
      <input
        v-if="type !== 'textarea'"
        ref="inputEle"
        v-bind="$attrs"
        :tabindex="tabindex"
        :type="showPassword ? (passwordVisible ? 'text': 'password') : type"
        :disabled="inputDisabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :aria-label="label"
        class="el-input__inner"
        @compositionstart="handleCompositionStart"
        @compositionupdate="handleCompositionUpdate"
        @compositionend="handleCompositionEnd"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
      />
      <!-- 前置内容 -->
      <span v-if="$slots.prefix || prefixIcon" class="el-input__prefix">
        <slot name="prefix"></slot>
        <i v-if="prefixIcon" class="el-input__icon" :class="prefixIcon"></i>
      </span>
      <!-- 后置内容 -->
      <span v-if="getSuffixVisible()" class="el-input__suffix">
        <span class="el-input__suffix-inner">
          <template v-if="!showClear || !showPwdVisible || !isWordLimitVisible">
            <slot name="suffix"></slot>
            <i v-if="suffixIcon" class="el-input__icon" :class="suffixIcon"></i>
          </template>
          <i
            v-if="showClear"
            class="el-input__icon el-icon-circle-close el-input__clear"
            @mousedown.prevent
            @click="clear"
          ></i>
          <i
            v-if="showPwdVisible"
            class="el-input__icon el-icon-view el-input__clear"
            @click="handlePasswordVisible"
          ></i>
          <span v-if="isWordLimitVisible" class="el-input__count">
            <span class="el-input__count-inner">{{ textLength }}/{{ upperLimit }}</span>
          </span>
        </span>
        <i
          v-if="validateState"
          class="el-input__icon"
          :class="['el-input__validateIcon', validateIcon]"
        ></i>
      </span>
      <!-- 后置元素 -->
      <div v-if="$slots.append" class="el-input-group__append">
        <slot name="append"></slot>
      </div>
    </template>
    <textarea
      v-else
      ref="textareaEle"
      :tabindex="tabindex"
      v-bind="$attrs"
      :disabled="inputDisabled"
      :readonly="readonly"
      :autocomplete="autocomplete"
      :style="textareaStyle"
      :aria-label="label"
      class="el-textarea__inner"
      @compositionstart="handleCompositionStart"
      @compositionupdate="handleCompositionUpdate"
      @compositionend="handleCompositionEnd"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @change="handleChange"
    ></textarea>
    <span
      v-if="isWordLimitVisible && type === 'textarea'"
      class="el-input__count"
    >{{ textLength }}/{{ upperLimit }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, toRefs } from 'vue'
// import throttle from 'lodash/throttle'
// import { on, off } from '@element-plus/utils/dom'
// import { easeInOutCubic } from '@element-plus/utils/animation'
import { calcTextareaHeight, CalcTextareaHeightReturn } from './calcTextareaHeight'

interface IElBacktopProps {
  [key: string]: any
}

interface ElInputState {
  textareaCalcStyle: CalcTextareaHeightReturn
  hovering: boolean
  focused: boolean
  isComposing: boolean
  passwordVisible: boolean
}

export default defineComponent({
  name: 'ElInput',
  props: {
    value: [String, Number],
    modelValue: [String, Number],
    size: String,
    resize: String,
    form: String,
    disabled: Boolean,
    readonly: Boolean,
    type: {
      type: String,
      default: 'text',
    },
    autosize: {
      type: [Boolean, Object],
      default: false,
    },
    autocomplete: {
      type: String,
      default: 'off',
    },
    /** @Deprecated in next major version */
    autoComplete: {
      type: String,
      validator () {
        process.env.NODE_ENV !== 'production' &&
            console.warn('[Element Warn][Input]\'auto-complete\' property will be deprecated in next major version. please use \'autocomplete\' instead.')
        return true
      },
    },
    validateEvent: {
      type: Boolean,
      default: true,
    },
    suffixIcon: String,
    prefixIcon: String,
    label: String,
    clearable: {
      type: Boolean,
      default: false,
    },
    showPassword: {
      type: Boolean,
      default: false,
    },
    showWordLimit: {
      type: Boolean,
      default: false,
    },
    tabindex: String,
  },
  emits: ['click'],
  setup(props: IElBacktopProps) {
    const state = reactive<ElInputState>({
      textareaCalcStyle: {},
      hovering: false,
      focused: false,
      isComposing: false,
      passwordVisible: false,
    })
    const inputEle = ref(null)
    const textareaEle = ref(null)
    const vm = computed(() => props.type === 'textarea' ? textareaEle.value : inputEle.value)

    const resizeTextarea = () => {
      // if (this.$isServer) return;
      const { autosize, type } = props
      if (type !== 'textarea') return
      if (!autosize) {
        state.textareaCalcStyle = {
          minHeight: calcTextareaHeight(textareaEle.value).minHeight,
        }
        return
      }
      const minRows = autosize.minRows
      const maxRows = autosize.maxRows
      state.textareaCalcStyle = calcTextareaHeight(textareaEle.value, minRows, maxRows)
    }

    console.log(vm)

    return {
      ...toRefs(state),
      inputEle,
      textareaEle,
      resizeTextarea,
    }
  },
})
</script>
