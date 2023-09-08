export const validExternal = /^(https?:|mailto:|tel:)/
/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path: string) {
  return validExternal.test(path)
}

export const validUsername = /^(admin|editor)/
/**
 * @param {string} str
 * @returns {Boolean}
 */
export function isUsername(str: string) {
  return validUsername.test(str)
}

export const validURL =
  /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
/**
 * @param {string} url
 * @returns {Boolean}
 */
export function isURL(url: string) {
  return validURL.test(url)
}

export const validLowerCase = /^[a-z]+$/
/**
 * @param {string} str
 * @returns {Boolean}
 */
export function isLowerCase(str: string) {
  return validLowerCase.test(str)
}

export const validUpperCase = /^[A-Z]+$/
/**
 * @param {string} str
 * @returns {Boolean}
 */
export function isUpperCase(str: string) {
  return validUpperCase.test(str)
}

export const validAlphabets = /^[A-Za-z]+$/
/**
 * @param {string} str
 * @returns {Boolean}
 */
export function isAlphabets(str: string) {
  return validAlphabets.test(str)
}

export const validEmail =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
/**
 * @param {string} email
 * @returns {Boolean}
 */
export function isEmail(email: string) {
  return validEmail.test(email)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function isString(str: string | any) {
  if (typeof str === 'string' || str instanceof String) {
    return true
  }
  return false
}

/**
 * @param {Array} arg
 * @returns {Boolean}
 */
export function isArray(arg: any[]) {
  if (typeof Array.isArray === 'undefined') {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
  return Array.isArray(arg)
}
