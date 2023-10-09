import axios from 'axios'
import type { AxiosResponse } from 'axios'

// interface AxiosStatic extends AxiosInstance {
//   postJson<T = unknown, R = AxiosResponse<T>>(
//     url: string,
//     data?: unknown,
//     config?: AxiosRequestConfig
//   ): Promise<R>;
// }

const request = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  // `withCredentials` 表示跨域请求时是否需要使用凭证
  withCredentials: true // default
})

export function getMessageByCode(code: number, message = '') {
  // 这里用来处理http常见错误，进行全局提示
  let errorMessage = ''
  switch (code) {
    case 400:
      errorMessage = '请求错误(400)'
      break
    case 401:
      errorMessage = '未授权，请重新登录(401)'
      // 这里可以做清空storage并跳转到登录页的操作
      break
    case 403:
      errorMessage = '拒绝访问(403)'
      break
    case 404:
      errorMessage = '请求出错(404)'
      break
    case 408:
      errorMessage = '请求超时(408)'
      break
    case 500:
      errorMessage = '服务器错误(500)'
      break
    case 501:
      errorMessage = '服务未实现(501)'
      break
    case 502:
      errorMessage = '网络错误(502)'
      break
    case 503:
      errorMessage = '服务不可用(503)'
      break
    case 504:
      errorMessage = '网络超时(504)'
      break
    case 505:
      errorMessage = 'HTTP版本不受支持(505)'
      break
    default:
      errorMessage = `连接出错(${message})!`
  }
  return errorMessage
}
request.interceptors.response.use(
  (res: AxiosResponse) => {
    // 直接返回res，当然你也可以只返回res.data
    // 系统如果有自定义code也可以在这里处理
    const code = res.data?.code || res.status || 200
    if (![1, 200, 3000].includes(code)) {
      return Promise.reject(res)
    }
    return res
  },
  (err: any) => {
    return Promise.reject(err.response)
  }
)

export default request
