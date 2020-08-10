<template>
  <transition-group
    tag="ul"
    :class="[
      'el-upload-list',
      'el-upload-list--' + listType,
      { 'is-disabled': disabled }
    ]"
    name="el-list"
  >
    <li
      v-for="file in files"
      :key="file.uid"
      :class="['el-upload-list__item', 'is-' + file.status, focusing ? 'focusing' : '']"
      tabindex="0"
      @keydown.delete="!disabled && $emit('remove', file)"
      @focus="focusing = true"
      @blur="focusing = false"
      @click="focusing = false"
    >
      <slot :file="file">
        <img
          v-if="file.status !== 'uploading' && ['picture-card', 'picture'].indexOf(listType) > -1"
          class="el-upload-list__item-thumbnail"
          :src="file.url"
          alt=""
        >
        <a class="el-upload-list__item-name" @click="handleClick(file)">
          <i class="el-icon-document"></i>{{ file.name }}
        </a>
        <label class="el-upload-list__item-status-label">
          <i
            :class="{
              'el-icon-upload-success': true,
              'el-icon-circle-check': listType === 'text',
              'el-icon-check': ['picture-card', 'picture'].indexOf(listType) > -1
            }"
          ></i>
        </label>
        <i v-if="!disabled" class="el-icon-close" @click="$emit('remove', file)"></i>
        <!-- Due to close btn only appears when li gets focused disappears after li gets blurred, thus keyboard navigation can never reach close btn-->
        <!-- This is a bug which needs to be fixed -->
        <!-- TODO: Fix the incorrect navigation interaction -->
        <i v-if="!disabled" class="el-icon-close-tip">{{ t('el.upload.deleteTip') }}</i>
        <el-progress
          v-if="file.status === 'uploading'"
          :type="listType === 'picture-card' ? 'circle' : 'line'"
          :stroke-width="listType === 'picture-card' ? 6 : 2"
          :percentage="parsePercentage(file.percentage)"
        />
        <span v-if="listType === 'picture-card'" class="el-upload-list__item-actions">
          <span
            v-if="handlePreview && listType === 'picture-card'"
            class="el-upload-list__item-preview"
            @click="handlePreview(file)"
          >
            <i class="el-icon-zoom-in"></i>
          </span>
          <span
            v-if="!disabled"
            class="el-upload-list__item-delete"
            @click="$emit('remove', file)"
          >
            <i class="el-icon-delete"></i>
          </span>
        </span>
      </slot>
    </li>
  </transition-group>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'
import { noop } from 'lodash-es'

import { t } from '@element-plus/locale'
import ElProgress from '@element-plus/progress'

import type { PropType } from 'vue'

export default defineComponent({
  name: 'ElUploadList',
  components: { ElProgress },
  props: {
    files: {
      type: Array as PropType<File[]>,
      default() {
        return []
      },
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    handlePreview: {
      type: Function as PropType<(file: File) => void>,
      default: noop,
    },
    listType: {
      type: String as PropType<'picture' | 'picture-card' | 'text'>,
      default: 'text',
    },
  },
  emits: ['remove'],
  setup(props) {
    const parsePercentage = (val: string) => {
      return parseInt(val, 10)
    }

    const handleClick = (file: File) => {
      props?.handlePreview(file)
    }

    return {
      focusing: ref(false),
      parsePercentage,
      handleClick,
      t,
    }
  },
})
</script>
