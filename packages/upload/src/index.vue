<template>
  <div>
    <template v-if="showFileList && listType === 'picture-card'">
      <upload-list
        :disabled="{uploadDisabled}"
        :files="uploadFiles"
        handle-preview="onPreview"
        list-type="picture-card"
        @remove="handleRemove"
      >
        <template #default="file">

        </template>
        {
        (props) => {
        if (this.$scopedSlots.file) {
        return this.$scopedSlots.file({
        file: props.file
        });
        }
        }
        }x`x`
      </upload-list>
    </template>
    { this.listType === 'picture-card' ? uploadList : ''}
    {
    this.$slots.trigger
    ? [uploadComponent, this.$slots.default]
    : uploadComponent
    }
    {this.$slots.tip}
    { this.listType !== 'picture-card' ? uploadList : ''}
  </div>
</template>
<script lang='ts'>
import { defineComponent, ref } from 'vue'
import { noop } from 'lodash-es'

import ElProgress from '@element-plus/progress'

import UploadList from './upload-list.vue'
import Upload from './upload.vue'

import type { PropType } from 'vue'

export default defineComponent({
  name: 'ElUpload',
  components: {
    ElProgress,
    Upload,
    UploadList,
  },
  provide: {
    uploader() {
      return this
    },
  },
  props: { },
  setup(props) {
    // init here
  },
})
</script>
<style scoped>
</style>
