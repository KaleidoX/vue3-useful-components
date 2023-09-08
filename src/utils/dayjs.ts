import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
// import updateLocale from 'dayjs/plugin/updateLocale'
// dayjs.extend(updateLocale)
// dayjs.updateLocale('zh-cn', {
//   relativeTime: {
//     dd: 'YYYY-MM-DD',
//     M: 'YYYY-MM-DD',
//     MM: 'YYYY-MM-DD',
//     y: 'YYYY-MM-DD',
//     yy: 'YYYY-MM-DD'
//   }
// })

export default dayjs
