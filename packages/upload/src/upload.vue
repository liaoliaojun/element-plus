<template>
  <div
    :class="['el-upload', `el-upload--${listType}`]"
    tabindex="0"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <template v-if="drag">
      <upload-dragger :disabled="disabled" @file="uploadFiles">
        <slot></slot>
      </upload-dragger>
    </template>
    <template v-else>
      <slot></slot>
    </template>
    <input
      ref="input"
      class="el-upload__input"
      type="file"
      :name="name"
      :multiple="multiple"
      :accept="accept"
      @change="handleChange"
    ></input>
  </div>
</template>

<script lang="tsx">
import { defineComponent, inject, ref } from 'vue'
import { noop } from 'lodash-es'
import type { PropType } from 'vue'
import ajax from './ajax'
import UploadDragger from './upload-dragger.vue'
export default defineComponent({
  components: {
    UploadDragger,
  },
  props: {
    type: {
      type: String,
      default: '',
    },
    action: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: 'file',
    },
    data: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => null,
    },
    headers: {
      type: Object as PropType<Nullable<Partial<Headers>>>,
      default: () => null,
    },
    withCredentials: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean as PropType<Nullable<boolean>>,
      default: null,
    },
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#Unique_file_type_specifiers
    accept: {
      type: String,
      default: '',
    },
    onStart: {
      type: Function,
      default: noop,
    },
    onProgress: {
      type: Function,
      default: noop,
    },
    onSuccess: {
      type: Function,
      default: noop,
    },
    onError: {
      type: Function,
      default: noop,
    },
    beforeUpload: {
      type: Function,
      default: noop,
    },
    drag: Boolean,
    onPreview: {
      type: Function,
      default: noop,
    },
    onRemove: {
      type: Function,
      default: noop,
    },
    fileList: {
      type: Array as PropType<File[]>,
      default: [],
    },
    autoUpload: {
      type: Boolean,
      default: true,
    },
    listType: {
      type: String,
      default: '',
    },
    httpRequest: {
      type: Function,
      default: ajax,
    },
    disabled: Boolean,
    limit: {
      type: Number as PropType<Nullable<number>>,
      default: null,
    },
    onExceed: {
      type: Function,
      default: noop,
    },
  },
  setup() {
    const uploader = inject('uploader', {})
    return {
      reqs: ref({}),
      mouseover: ref(false),
      uploader,
    }
  },
  methods: {
    isImage(str) {
      return str.indexOf('image') !== -1
    },
    handleChange(ev) {
      const files = ev.target.files
      if (!files) return
      this.uploadFiles(files)
    },
    uploadFiles(files) {
      if (this.limit && this.fileList.length + files.length > this.limit) {
        this.onExceed && this.onExceed(files, this.fileList)
        return
      }
      let postFiles = Array.prototype.slice.call(files)
      if (!this.multiple) { postFiles = postFiles.slice(0, 1) }
      if (postFiles.length === 0) { return }
      postFiles.forEach(rawFile => {
        this.onStart(rawFile)
        if (this.autoUpload) this.upload(rawFile)
      })
    },
    upload(rawFile) {
      this.$refs.input.value = null
      if (!this.beforeUpload) {
        return this.post(rawFile)
      }
      const before = this.beforeUpload(rawFile)
      if (before && before.then) {
        before.then(processedFile => {
          const fileType = Object.prototype.toString.call(processedFile)
          if (fileType === '[object File]' || fileType === '[object Blob]') {
            if (fileType === '[object Blob]') {
              processedFile = new File([processedFile], rawFile.name, {
                type: rawFile.type,
              })
            }
            for (const p in rawFile) {
              if (rawFile.hasOwnProperty(p)) {
                processedFile[p] = rawFile[p]
              }
            }
            this.post(processedFile)
          } else {
            this.post(rawFile)
          }
        }, () => {
          this.onRemove(null, rawFile)
        })
      } else if (before !== false) {
        this.post(rawFile)
      } else {
        this.onRemove(null, rawFile)
      }
    },
    abort(file) {
      const { reqs } = this
      if (file) {
        let uid = file
        if (file.uid) uid = file.uid
        if (reqs[uid]) {
          reqs[uid].abort()
        }
      } else {
        Object.keys(reqs).forEach((uid) => {
          if (reqs[uid]) reqs[uid].abort()
          delete reqs[uid]
        })
      }
    },
    post(rawFile) {
      const { uid } = rawFile
      const options = {
        headers: this.headers,
        withCredentials: this.withCredentials,
        file: rawFile,
        data: this.data,
        filename: this.name,
        action: this.action,
        onProgress: e => {
          this.onProgress(e, rawFile)
        },
        onSuccess: res => {
          this.onSuccess(res, rawFile)
          delete this.reqs[uid]
        },
        onError: err => {
          this.onError(err, rawFile)
          delete this.reqs[uid]
        },
      }
      const req = this.httpRequest(options)
      this.reqs[uid] = req
      if (req && req.then) {
        req.then(options.onSuccess, options.onError)
      }
    },
    handleClick() {
      if (!this.disabled) {
        this.$refs.input.value = null
        this.$refs.input.click()
      }
    },
    handleKeydown(e) {
      if (e.target !== e.currentTarget) return
      if (e.keyCode === 13 || e.keyCode === 32) {
        this.handleClick()
      }
    },
  },
})
</script>
