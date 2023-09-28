import dayjs from './dayjs'

/**
 * 时间字符格式化处理
 * @param {string | number | Date | dayjs.Dayjs} date 时间
 * @returns yyyy-MM-DD格式时间字符串
 */
export const formatDateFull = (date: string | number | Date | dayjs.Dayjs) =>
  dayjs(date).format('YYYY-MM-DD HH:mm:ss')

/**
 * 时间字符格式化处理
 * @param {string | number | Date | dayjs.Dayjs} date 时间
 * @param {string} template  格式时间字符串模板
 * @returns yyyy-MM-DD格式时间字符串
 */
export const formatDate = (
  date: string | number | Date | dayjs.Dayjs,
  template: string = 'YYYY-MM-DD'
) => dayjs(date).format(template)

/**
 * 获取相对当前时间（前）
 * @param {string | number | Date | dayjs.Dayjs} date 时间
 * @returns yyyy-MM-DD格式时间字符串
 */
export const formatRelativeTime = (date: string | number | Date | dayjs.Dayjs) =>
  dayjs(date).fromNow()

export const validUploadPrefix = /^(.?)+upload/
/**
 * 文件路径格式化 基础平台
 * @param {String} url 上传文件路径
 * @returns 有效路径
 */
export const formatUploadBase = (url: string, prefix: string = '') =>
  (url || '').replace(validUploadPrefix, `${prefix}/upload`)

/**
 * 重置 文件路径格式化 基础平台
 * @param {String} url 上传文件路径
 * @returns 有效路径
 */
export const resetUploadBase = (url: string) => url.replace(validUploadPrefix, 'upload')

/**
 * 输出 times 个 str 字符组成的字符串
 * @param {number} times 插入个数
 * @param {string} str 插入字符串
 */
export const repeat = (times: number, str = '0') => {
  return new Array(times + 1).join(str)
}
/**
 * 时间前面 +0
 * @param {number} num 需要格式化的时间
 * @param {number} maxLength 预设时间长度
 */
export const pad = (num: number, maxLength = 2) => {
  return ''.concat(repeat(maxLength - num.toString().length, '0')).concat(String(num))
}
