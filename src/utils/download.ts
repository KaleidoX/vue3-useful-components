import axios, { type AxiosResponse } from 'axios'
import { saveAs } from 'file-saver'

let downloadLoadingInstance: any

// 验证是否为blob格式
export function blobValidate(data: { type: string }) {
  return data.type !== 'application/json'
}

export const loadingOpen = () => {
  downloadLoadingInstance = ElLoading.service({
    text: '正在下载数据，请稍候',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.4)'
  })
}
export const loadingClose = () => {
  downloadLoadingInstance.close()
}

export const getFileNameFormHeaders = (response: AxiosResponse<any, any>) => {
  let fileName: string = ''
  if (response.headers['download-filename']) {
    fileName = response.headers['download-filename']
  } else {
    fileName = response.headers['content-disposition']
      .split(';')
      .find((item: string) => item.includes('filename'))
      ?.split('=')[1]
  }
  return decodeURIComponent(fileName)
}

export default {
  blob(url: string, name: string = '', params: any) {
    loadingOpen()
    return axios({
      baseURL: import.meta.env.VITE_BASE_API,
      method: 'get',
      url,
      params,
      responseType: 'blob'
    })
      .then((res) => {
        const isBlob = blobValidate(res.data)
        if (isBlob) {
          const blob = new Blob([res.data], {
            type: res.headers['content-type']
          })
          this.saveAs(blob, getFileNameFormHeaders(res) || name)
        } else {
          this.printErrMsg(res.data)
        }
      })
      .catch((r) => {
        console.error(r)
        ElMessage.error('下载文件出现错误，请联系管理员！')
      })
      .finally(() => {
        loadingClose()
      })
  },
  zip(url: string, name: string) {
    loadingOpen()
    return axios({
      baseURL: import.meta.env.VITE_BASE_API,
      method: 'get',
      url,
      responseType: 'blob'
    })
      .then((res) => {
        const isBlob = blobValidate(res.data)
        if (isBlob) {
          const blob = new Blob([res.data], { type: 'application/zip' })
          this.saveAs(blob, getFileNameFormHeaders(res) || name)
        } else {
          this.printErrMsg(res.data)
        }
      })
      .catch((r) => {
        console.error(r)
        ElMessage.error('下载文件出现错误，请联系管理员！')
      })
      .finally(() => {
        loadingClose()
      })
  },
  saveAs(text: Blob | File | string, name?: string, opts?: Object) {
    saveAs(text, name, opts)
  },
  async printErrMsg(data: any) {
    const resText = await data.text()
    const rspObj = JSON.parse(resText)
    const errMsg = rspObj.msg
    ElMessage.error(errMsg)
  }
}
