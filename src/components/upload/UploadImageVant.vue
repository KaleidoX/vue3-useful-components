<template>
  <van-uploader
    v-model="fileList"
    accept="image/*"
    :multiple="limit > 1"
    :max-count="limit"
    deletable
    preview-image
    image-fit="contain"
    result-type="file"
    :after-read="handleRead"
  />
</template>

<script lang="ts">
import { isArray, isString } from 'lodash-es'
import { uploadImage } from '@/api/upload'
import type { UploaderAfterRead, UploaderFileListItem } from 'vant'

export default {
  name: 'UploadImageVant',
  props: {
    modelValue: [String, Array],
    // 图片数量限制
    limit: {
      type: Number,
      default: 5
    },
    // 大小限制(MB)
    fileSize: {
      type: Number,
      default: 5
    },
    // 是否显示提示
    isShowTip: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { emit }) {
    const fileList = computed<UploaderFileListItem[]>({
      get: () => {
        if (props.modelValue) {
          const list = isString(props.modelValue) ? props.modelValue.split(',') : props.modelValue
          return list.map((item) => {
            if (isString(item)) {
              item = { name: item, url: item }
            }
            return item as UploaderFileListItem
          })
        } else {
          return []
        }
      },
      set: (newValue) => {
        emit('update:modelValue', newValue)
        return newValue
      }
    })
    const handleRead: UploaderAfterRead = (file) => {
      const fileList = isArray(file) ? file : [file]
      for (const fileItem of fileList) {
        fileItem.status = 'uploading'
        fileItem.message = '上传中...'
        if (!fileItem.file) return
        uploadImage(fileItem.file)
          .then(({ url }) => {
            fileItem.status = 'done'
            fileItem.message = '上传完成'
            fileItem.url = url
          })
          .catch(() => {
            fileItem.status = 'failed'
            fileItem.message = '上传失败'
          })
      }
    }
    return { fileList, handleRead }
  }
}
</script>
