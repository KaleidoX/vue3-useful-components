/**
 * easeInOutQuad
 * @param {number} t
 * @param {number} b
 * @param {number} c
 * @param {number} d
 */
const easeInOutQuad = function (t: number, b: number, c: number, d: number) {
  t /= d / 2
  if (t < 1) {
    return (c / 2) * t * t + b
  }
  t--
  return (-c / 2) * (t * (t - 2) - 1) + b
}

// requestAnimationFrame for Smart Animating http://goo.gl/sx5sts
export const requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    // @ts-expect-error polyfill
    window.webkitRequestAnimationFrame ||
    // @ts-expect-error polyfill
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60)
    }
  )
})()

/**
 * Because it's so fucking difficult to detect the scrolling element, just move them all
 * @param {number} amount
 */
function move(amount: number) {
  document.documentElement.scrollTop = amount
  if (document.body.parentNode) {
    // @ts-expect-error polyfill
    document.body.parentNode.scrollTop(amount)
  }
  document.body.scrollTop = amount
}

function position() {
  return (
    document.documentElement.scrollTop ||
    // @ts-expect-error polyfill
    document.body.parentNode?.scrollTop ||
    document.body.scrollTop
  )
}

/**
 * @param {HTMLElement} el
 * @returns {number}
 * @private
 * @see http://stackoverflow.com/a/1145918/2126720
 * @see https://github.com/philipwalton/flexbugs#3-min-height-0-with-flexbox
 **/
export const getOffsetTop = (el: HTMLElement): number => {
  return el.offsetParent
    ? el.offsetTop + getOffsetTop(el.offsetParent as HTMLElement)
    : el.offsetTop
}

/**
 * @param {number} to
 * @param {number} duration
 * @param {Function} callback
 */
export default function (to: number, duration: number, callback: () => void) {
  const start = position()
  const change = to - start
  const increment = 20
  let currentTime = 0
  duration = typeof duration === 'undefined' ? 500 : duration
  const animateScroll = function () {
    // increment the time
    currentTime += increment
    // find the value with the quadratic in-out easing function
    const val = easeInOutQuad(currentTime, start, change, duration)
    // move the document.body
    move(val)
    // do the animation unless its over
    if (currentTime < duration) {
      requestAnimFrame(animateScroll)
    } else {
      if (callback && typeof callback === 'function') {
        // the animation is done so lets callback
        callback()
      }
    }
  }
  animateScroll()
}
