import axios, { AxiosInstance, AxiosResponse } from 'axios'
import errorCode from '@/utils/errorCode'

// 创建axios实例
const service: AxiosInstance = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  // baseURL: '',
  // 超时
  // timeout: 3000,
})

// service.interceptors.request.use(function (config: AxiosRequestConfig) {
//   // Do something before request is sent
//   return config;
// }, function (error) {
//   // Do something with request error
//   return Promise.reject(error);
// });

// request拦截器
// service.interceptors.request.use(
//   (config) => {
//     // 是否需要设置 token
//     const isToken = (config.headers || {}).isToken === false;
//     if (getToken() && !isToken) {
//       config.headers["Authorization"] = "Bearer " + getToken(); // 让每个请求携带自定义token 请根据实际情况自行修改
//     }
//     return config;
//   },
//   (error) => {
//     Promise.reject(error);
//   }
// );

// let ConfirmLoginOut = null;

// 响应拦截器
service.interceptors.response.use(
  (res: AxiosResponse) => {
    // 未设置状态码则默认成功状态
    const code = res.data?.code || 200
    // 获取错误信息
    const msg: string = errorCode[code] || res.data.msg || errorCode['default']
    switch (code) {
      case 401: {
        // if (ConfirmLoginOut) {
        //   return;
        // }
        // ConfirmLoginOut = MessageBox.confirm(
        //   "登录状态已过期，您可以继续留在该页面，或者重新登录",
        //   "系统提示",
        //   {
        //     confirmButtonText: "重新登录",
        //     cancelButtonText: "取消",
        //     type: "warning",
        //   }
        // )
        //   .then(() => {
        //     store.dispatch("LogOut").then(() => {
        //       router.push("/index");
        //     });
        //   })
        //   .catch(() => {})
        //   .finally(() => {
        //     ConfirmLoginOut = null;
        //   });
        return Promise.reject('令牌验证失败')
      }
      case 500: {
        return Promise.reject(new Error(msg))
      }
      case 1:
      case 200:
      case 3000: {
        return res.data
      }

      default: {
        return Promise.reject(res.data)
      }
    }
  },
  (error: AxiosResponse) => {
    let { message } = error
    if (!message) {
      message = ''
    } else if (message == 'Network Error') {
      message = '后端接口连接异常'
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时'
    } else if (message.includes('Request failed with status code')) {
      message = '系统接口' + message.substr(message.length - 3) + '异常'
    }
    return Promise.reject(error)
  }
)

export default service
