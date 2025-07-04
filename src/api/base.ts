interface interfaceParams {
  page: number
  rows: number
}
interface interfaceResponseList {
  list: number[]
  count: number
  pageCount: number
}
/**
 * 模拟接口生成列表方法
 * @param {interfaceParams} params
 * @returns
 */
export const createList = (params: interfaceParams): Promise<interfaceResponseList> => {
  return new Promise((resolve) => {
    resolve({
      list: Array.from(new Array(params.rows).keys()).map(
        (item) => item + (params.page - 1) * params.rows
      ),
      count: 10 * params.rows,
      pageCount: 10
    })
  })
}
