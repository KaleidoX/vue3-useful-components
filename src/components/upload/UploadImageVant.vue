<template>
  <van-uploader
    v-model="fileList"
    accept="image/*"
    :multiple="limit > 1"
    :max-count="limit"
    deletable
    preview-image
    image-fit="container"
    result-type="file"
    :after-read="handleRead"
  />
</template>

<script>
import { isString } from 'lodash-es'
import { uploadImage } from '@/api/upload'

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
    const fileList = computed({
      get: () => {
        if (props.modelValue) {
          const list = isString(props.modelValue) ? props.modelValue.split(',') : props.modelValue
          return list.map((item) => {
            if (isString(item)) {
              item = { name: item, url: item }
            }
            return item
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
    const handleRead = (file) => {
      file.status = 'uploading'
      file.message = '上传中...'
      uploadImage(file.file)
        .then(({ url }) => {
          file.status = 'done'
          file.message = '上传完成'
          file.url = url
        })
        .catch(() => {
          file.status = 'failed'
          file.message = '上传失败'
        })
    }
    return { fileList, handleRead }
  }
}
</script>
