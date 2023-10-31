export const validExternal = /^(https?:|mailto:|tel:)/
/**
 * @param {string} path
 * @returns {boolean}
 */
export function isExternal(path: string) {
  return validExternal.test(path)
}

export const validUsername = /^(admin|editor)/
/**
 * @param {string} str
 * @returns {boolean}
 */
export function isUsername(str: string) {
  return validUsername.test(str)
}

export const validURL =
  /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
/**
 * @param {string} url
 * @returns {boolean}
 */
export function isURL(url: string) {
  return validURL.test(url)
}

export const validLowerCase = /^[a-z]+$/
/**
 * @param {string} str
 * @returns {boolean}
 */
export function isLowerCase(str: string) {
  return validLowerCase.test(str)
}

export const validUpperCase = /^[A-Z]+$/
/**
 * @param {string} str
 * @returns {boolean}
 */
export function isUpperCase(str: string) {
  return validUpperCase.test(str)
}

export const validAlphabets = /^[A-Za-z]+$/
/**
 * @param {string} str
 * @returns {boolean}
 */
export function isAlphabets(str: string) {
  return validAlphabets.test(str)
}

export const validEmail = /^[a-z0-9]+([._-][a-z0-9]+)*@([0-9a-z]+\.[a-z]{2,14}(\.[a-z]{2})?)$/
/**
 * 校验邮箱
 * @param {string} email 邮箱
 * @returns {boolean}
 */
export function isEmail(email: string) {
  return validEmail.test(email)
}

export const validTax = /^[0-9A-Z]{15,20}$/
/**
 * 校验税号
 * @param {string} tax 税号
 * @returns {boolean}
 */
export const isTax = (tax: string): boolean => {
  return validTax.test(tax)
}

export const validTel = /^1(3[0-9]|4[5|7]|5[0-3,5-9]|66|7[0,3,5-8]|8[0-3,5-9]|9[8|9])\d{8}$/
/**
 * 校验手机号
 * @param {string} telephone
 * @returns {boolean}
 */
export const isTel = (telephone: string): boolean => {
  return /^1(3[0-9]|4[5|7]|5[0-3,5-9]|66|7[0,3,5-8]|8[0-3,5-9]|9[8|9])\d{8}$/.test(telephone)
}

/**
 * 隐藏手机号中间四位
 * @param {string} telephone
 * @returns {string}
 */
export const encryptTel = (telephone: string): string => {
  return `${telephone.substr(0, 3)}****${telephone.substr(7)}`
}

export const validIdCard =
  /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}$)/

/**
 * 校验身份证号
 * @param {string} idCard
 * @returns {boolean}
 */
export const isIdCard = (idCard: string): boolean => {
  return validIdCard.test(idCard)
}

export const validPasswordComplex =
  /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\s])[0-9a-zA-Z~!@#$%^&*()_+=-`{}[\]:;"'<>,.?/]{6,32}$/
/**
 * 校验身份证号
 * @param {string} password
 * @returns {boolean}
 */
export const isPasswordComplex = (password: string): boolean => {
  return validPasswordComplex.test(password)
}
