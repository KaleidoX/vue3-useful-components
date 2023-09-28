<!-- from https://gitee.com/y_project/RuoYi-Vue/blob/master/ruoyi-ui/src/components/ImageUpload/index.vue -->
<template>
  <div class="component-upload-image">
    <el-upload
      :action="uploadImgUrl"
      list-type="picture-card"
      :on-success="handleUploadSuccess"
      :before-upload="handleBeforeUpload"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      name="file"
      :on-remove="handleRemove"
      :show-file-list="true"
      :headers="headers"
      :file-list="fileList"
      :on-preview="handlePictureCardPreview"
      :class="{ hide: this.fileList.length >= this.limit }"
    >
      <i class="i-ep:plus"></i>
      <!-- 上传提示 -->
      <template v-slot:tip v-if="showTip">
        <div class="el-upload__tip">
          请上传
          <template v-if="fileSize">
            大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b>
          </template>
          <template v-if="fileType">
            格式为 <b style="color: #f56c6c">{{ fileType.join('/') }}</b>
          </template>
          的文件
        </div>
      </template>
    </el-upload>

    <el-dialog v-model="dialogVisible" title="预览" width="800" append-to-body>
      <img :src="dialogImageUrl" style="display: block; max-width: 100%; margin: 0 auto" />
    </el-dialog>
  </div>
</template>

<script>
import { isArray, isString } from 'lodash-es'

export default {
  name: 'UploadImageElement',
  props: {
    modelValue: [String, Object, Array],
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
    // 文件类型, 例如['png', 'jpg', 'jpeg']
    fileType: {
      type: Array,
      default: () => ['png', 'jpg', 'jpeg']
    },
    // 是否显示提示
    isShowTip: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      dialogImageUrl: '',
      dialogVisible: false,
      hideUpload: false,
      baseUrl: import.meta.env.VITE_BASE_API,
      uploadImgUrl: import.meta.env.VITE_BASE_API + '/common/upload', // 上传的图片服务器地址
      headers: {
        Authorization: 'Bearer ' + ''
      },
      fileList: []
    }
  },
  watch: {
    modelValue: {
      handler(val) {
        if (val) {
          // 首先将值转为数组
          const list = Array.isArray(val) ? val : this.modelValue.split(',')
          // 然后将数组转为对象数组
          this.fileList = list.map((item) => {
            if (typeof item === 'string') {
              if (item.indexOf(this.baseUrl) === -1) {
                item = { name: this.baseUrl + item, url: this.baseUrl + item }
              } else {
                item = { name: item, url: item }
              }
            }
            return item
          })
        } else {
          this.fileList = []
          return []
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    // 是否显示提示
    showTip() {
      return this.isShowTip && (this.fileType || this.fileSize)
    }
  },
  methods: {
    // 删除图片
    handleRemove(file) {
      const findex = this.fileList.map((f) => f.name).indexOf(file.name)
      this.fileList.splice(findex, 1)
      this.$emit('update:modelValue', this.listToString(this.fileList))
    },
    // 上传成功回调
    handleUploadSuccess(res) {
      this.fileList.push({ name: res.fileName, url: res.fileName })
      this.$emit('update:modelValue', this.listToString(this.fileList))
      this.loading && this.loading.close()
    },
    // 上传前loading加载
    handleBeforeUpload(file) {
      let isImg = false
      if (this.fileType.length) {
        let fileExtension = ''
        if (file.name.lastIndexOf('.') > -1) {
          fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1)
        }
        isImg = this.fileType.some((type) => {
          if (file.type.indexOf(type) > -1) return true
          if (fileExtension && fileExtension.indexOf(type) > -1) return true
          return false
        })
      } else {
        isImg = file.type.indexOf('image') > -1
      }

      if (!isImg) {
        ElMessage.error(`文件格式不正确, 请上传${this.fileType.join('/')}图片格式文件!`)
        return false
      }
      if (this.fileSize) {
        const isLt = file.size / 1024 / 1024 < this.fileSize
        if (!isLt) {
          ElMessage.error(`上传头像图片大小不能超过 ${this.fileSize} MB!`)
          return false
        }
      }
      this.loading = ElLoading.service({
        lock: true,
        text: '上传中',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },
    // 文件个数超出
    handleExceed() {
      ElMessage.error(`上传文件数量不能超过 ${this.limit} 个!`)
    },
    // 上传失败
    handleUploadError() {
      ElMessage.error('上传失败')
      this.loading && this.loading.close()
    },
    // 预览
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    // 对象转成指定字符串分隔
    listToString(list, separator) {
      separator = separator || ','
      if (isArray(list)) {
        return list.map((item) => (item.url || '').replace(this.baseUrl, '')).join(separator)
      } else {
        return isString(list) ? list : ''
      }
    }
  }
}
</script>
<style scoped lang="scss">
// .el-upload--picture-card 控制加号部分
:deep() {
  .hide .el-upload--picture-card {
    display: none;
  }
  // 去掉动画效果
  .el-list-enter-active,
  .el-list-leave-active {
    transition: all 0s;
  }
  .el-list-enter,
  .el-list-leave-active {
    opacity: 0;
    transform: translateY(0);
  }
}
</style>
