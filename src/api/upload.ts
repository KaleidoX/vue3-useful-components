import md5 from 'md5'

/**
 * 上传文件
 * @param {File} file 文件
 * @returns
 */
export const uploadImage = (file: File) => {
  return new Promise(async (resolve) => {
    const url = await imgToBase64(file)
    resolve({
      name: file.name,
      // url: `/upload/image/${md5(file.name)}`
      url: url
    })
  })
}
