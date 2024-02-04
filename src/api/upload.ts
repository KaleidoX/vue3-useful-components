import md5 from 'md5'

/**
 * 上传文件
 * @param {File} file 文件
 * @returns
 */
export const uploadImage = async (file: File) => {
  const url = await imgToBase64(file)
  return {
    name: file.name,
    // url: `/upload/image/${md5(file.name)}`
    url: url
  }
}
