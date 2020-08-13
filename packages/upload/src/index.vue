<script lang='ts'>
import {
  computed,
  defineComponent,
  h,
  getCurrentInstance,
  inject,
  ref,
  provide,
  watch,
} from 'vue'
import { NOOP } from '@vue/shared'

import ajax from './ajax'
import UploadList from './upload-list.vue'
import Upload from './upload.vue'

import type { PropType, Ref } from 'vue'
import type { ListType, UploadFile, ElFile, ElUploadProgressEvent } from './upload'

export default defineComponent({
  name: 'ElUpload',
  components: {
    Upload,
    UploadList,
  },
  props: {
    action: {
      type: String,
      required: true,
    },
    headers: {
      type: Object as PropType<Headers>,
      default: () => ({}),
    },
    data: {
      type: Object,
      default: () => ({}),
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: 'file',
    },
    drag: {
      type: Boolean,
      default: false,
    },
    withCredentials: Boolean,
    showFileList: {
      type: Boolean,
      default: true,
    },
    accept: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'select',
    },
    beforeUpload: {
      type: Function,
      default: () => NOOP,
    },
    beforeRemove: {
      type: Function,
      default: () => NOOP,
    },
    onRemove: {
      type: Function,
      default: () => NOOP,
    },
    onChange: {
      type: Function,
      default: () => NOOP,
    },
    onPreview: {
      type: Function,
      default: () => NOOP,
    },
    onSuccess: {
      type: Function,
      default: () => NOOP,
    },
    onProgress: {
      type: Function,
      default: () => NOOP,
    },
    onError: {
      type: Function,
      default: () => NOOP,
    },
    fileList: {
      type: Array as PropType<UploadFile[]>,
      default: () => {
        return [] as PropType<UploadFile[]>
      },
    },
    autoUpload: {
      type: Boolean,
      default: true,
    },
    listType: {
      type: String as PropType<ListType>,
      default: 'text', // text,picture,picture-card
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
      default: () => NOOP,
    },
  },
  setup(props) {
    // init here
    const elForm = inject('elForm', {} as { disabled: boolean; })

    const uploadDisabled = computed(() => {
      return props.disabled || (elForm).disabled
    })
    const uploadFiles =  ref([]) as Ref<UploadFile[]>
    const tempIndex = ref(1)
    const uploadRef = ref(null) as Ref<typeof Upload>

    function genUid() {
      return Date.now() + tempIndex.value++
    }

    function getFile(rawFile: ElFile) {
      return uploadFiles.value.find((file) => file.uid === rawFile.uid)
    }

    function handleError(err: Error, rawFile: ElFile) {
      const file = getFile(rawFile)
      file.status = 'fail'
      uploadFiles.value.splice(uploadFiles.value.indexOf(file), 1)
      props.onError(err, file, uploadFiles.value)
      props.onChange(file, uploadFiles.value)
    }

    function abort(file: ElFile) {
      uploadRef.value.abort(file)
    }

    function clearFiles() {
      uploadFiles.value = []
    }

    function submit() {
      uploadFiles.value
        .filter(file => file.status === 'ready')
        .forEach(file => {
          uploadRef.value.upload(file.raw)
        })
    }

    function handleProgress(ev: ElUploadProgressEvent, rawFile: ElFile) {
      const file = getFile(rawFile)
      props.onProgress(ev, file, uploadFiles.value)
      file.status = 'uploading'
      file.percentage = ev.percent || 0
    }

    function handleSuccess(res, rawFile) {
      const file = getFile(rawFile)
      if (file) {
        file.status = 'success'
        file.response = res
        props.onSuccess(res, file, uploadFiles.value)
        props.onChange(file, uploadFiles.value)
      }
    }

    function handleStart(rawFile: ElFile) {
      const uid = genUid()
      rawFile.uid = uid
      const file: UploadFile = {
        name: rawFile.name,
        percentage: 0,
        status: 'ready',
        size: rawFile.size,
        raw: rawFile,
        uid,
      }
      if (props.listType === 'picture-card' || props.listType === 'picture') {
        try {
          file.url = URL.createObjectURL(rawFile)
        } catch (err) {
          console.error('[Element Error][Upload]', err)
          props.onError(err, file, uploadFiles.value)
        }
      }
      uploadFiles.value.push(file)
      props.onChange(file, uploadFiles.value)
    }

    function handleRemove(file, raw: ElFile) {
      if (raw) {
        file = getFile(raw)
      }
      let doRemove = () => {
        abort(file)
        let fileList = uploadFiles.value
        fileList.splice(fileList.indexOf(file), 1)
        props.onRemove(file, fileList)
      }
      if (!props.beforeRemove) {
        doRemove()
      } else if (typeof props.beforeRemove === 'function') {
        const before = props.beforeRemove(file, uploadFiles.value)
        if (before instanceof Promise) {
          before.then(() => {
            doRemove()
          }).catch(NOOP)
        } else if (before !== false) {
          doRemove()
        }
      }
    }

    watch(() => props.listType, (val: ListType) => {
      if (val === 'picture-card' || val === 'picture') {
        uploadFiles.value = uploadFiles.value.map(file => {
          if (!file.url && file.raw) {
            try {
              file.url = URL.createObjectURL(file.raw)
            } catch (err) {
              props.onError(err, file, uploadFiles.value)
            }
          }
          return file
        })
      }
    })

    watch(() => props.fileList, (fileList: UploadFile[]) => {
      uploadFiles.value = fileList.map(file => {
        file.uid = file.uid || genUid()
        file.status = file.status || 'success'
        return file
      })
    }, {
      immediate: true,
    })

    provide('uploader', getCurrentInstance())

    return {
      dragOver: ref(false),
      draging: ref(false),
      genUid,
      tempIndex,
      handleError,
      handleProgress,
      handleRemove,
      handleStart,
      handleSuccess,
      uploadDisabled,
      uploadFiles,
      uploadRef,
      submit,
      clearFiles,
    }
  },

  beforeUnmount() {
    this.uploadFiles.forEach(file => {
      if (file.url && file.url.indexOf('blob:') === 0) {
        URL.revokeObjectURL(file.url)
      }
    })
  },
  render() {
    let uploadList
    if (this.showFileList) {
      uploadList =
        h(UploadList, {
          disabled: this.uploadDisabled,
          listType: this.listType,
          files: this.uploadFiles,
          onRemove: this.handleRemove,
          handlePreview: this.onPreview,
        },
        {
          file: (props: { file: UploadFile; }) => {
            if (this.$slots.file) {
              return this.$slots.file({
                file: props.file,
              })
            }
            return null
          },
        },
        )
    } else {
      uploadList = null
    }

    const uploadData = {
      type: this.type,
      drag: this.drag,
      action: this.action,
      multiple: this.multiple,
      'before-upload': this.beforeUpload,
      'with-credentials': this.withCredentials,
      headers: this.headers,
      name: this.name,
      data: this.data,
      accept: this.accept,
      fileList: this.uploadFiles,
      autoUpload: this.autoUpload,
      listType: this.listType,
      disabled: this.uploadDisabled,
      limit: this.limit,
      'on-exceed': this.onExceed,
      'on-start': this.handleStart,
      'on-progress': this.handleProgress,
      'on-success': this.handleSuccess,
      'on-error': this.handleError,
      'on-preview': this.onPreview,
      'on-remove': this.handleRemove,
      'http-request': this.httpRequest,
      ref: 'uploadRef',
    }
    const trigger = this.$slots.trigger || this.$slots.default
    const uploadComponent = h(Upload, uploadData, [
      trigger(),
    ])
    return h(
      'div',
      [
        this.listType === 'picture-card' ? uploadList : null,
        this.$slots.trigger ? [uploadComponent, this.$slots.default()] : uploadComponent,
        this.$slots?.tip(),
        this.listType !== 'picture-card' ? uploadList : null,
      ],
    )
  },
})
</script>
