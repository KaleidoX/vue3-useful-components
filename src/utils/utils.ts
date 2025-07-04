export function getClientWidth() {
  return window.screen.width
}
export function getClientHeight() {
  return window.screen.height
}
/**
 * 解析xml数据
 * @param {string} xmlString xml字符串
 * @returns {Object}
 */
export function parseXml(xmlString: string) {
  //Firefox, Mozilla, Opera, etc.
  try {
    const xmlDoc = new DOMParser().parseFromString(xmlString, 'text/xml')
    return xmlDoc
  } catch (e) {
    //Internet Explorer
    console.error(e);
    try {
      // @ts-expect-error eslint-disable-next-line no-undef, no-redeclare
      const xmlDoc = new ActiveXObject('Microsoft.XMLDOM')
      xmlDoc.async = 'false'
      xmlDoc.loadXML(xmlString)
      return xmlDoc
    } catch (e) {
      console.error(e)
      return {}
    }
  }
}
/**
 * 截取资源地址文件后缀
 * @param {string} url 需要处理的资源地址
 * @returns {string} 文件后缀
 */
export const sliceUrlSuffix = (url: string) => url.slice(url.lastIndexOf('.') + 1)

const suffix2type = {
  // 图片格式
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  bmp: 'image',
  gif: 'image',
  // 匹配txt
  txt: 'txt',
  // 匹配 excel
  xls: 'excel',
  xlsx: 'excel',
  // 匹配 word
  doc: 'word',
  docx: 'word',
  // 匹配 pdf
  pdf: 'pdf',
  // 匹配 ppt
  ppt: 'ppt',
  pptx: 'ppt',
  // 匹配 视频
  mp4: 'video',
  m2v: 'video',
  mkv: 'video',
  rmvb: 'video',
  wmv: 'video',
  avi: 'video',
  flv: 'video',
  mov: 'video',
  m4v: 'video',
  // 匹配 音频
  mp3: 'audio',
  midi: 'audio',
  wav: 'audio',
  wma: 'audio',
  arm: 'audio'
}
type TypeFileSuffix = keyof typeof suffix2type

/**
 * 获取文件类型
 * @param {String} fileName 文件名称
 * @returns {String}
 */
export function getFileType(fileName: string) {
  // 后缀获取
  const suffix: TypeFileSuffix = sliceUrlSuffix(fileName).toLocaleLowerCase() as TypeFileSuffix
  // fileName无后缀返回 "false"
  if (!suffix) {
    return ''
  }

  return suffix2type[suffix] || ''
}
