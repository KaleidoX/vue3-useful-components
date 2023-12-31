import router from '@/router/index.js'
import { isString } from 'lodash-es'
import type { DirectiveBinding } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

/**
 * 页面返回控制
 * @param {string} backLink 返回地址
 * @param {string} backType 返回方式
 */
export const pageBack = (backLink: RouteLocationRaw = '/home', backType = 'replace') => {
  if (history?.state?.back === router.resolve(backLink).fullPath) {
    router.back()
    return
  }
  switch (backType) {
    case 'push':
      router.push(backLink)
      break
    case 'replace':
      router.replace(backLink)
      break
    case 'target_self':
      if (isString(backLink)) {
        location.href = backLink
      }
      break
    case 'target_blank':
      if (isString(backLink)) {
        window.open(backLink)
      }
      break
    default:
      break
  }
}

/**
 * 页面返回控制
 */
export const clickBack = {
  /**
   * 在绑定元素的 attribute 前
   * 或事件监听器应用前调用
   * @param {Element} el 指令绑定到的元素。这可以用于直接操作 DOM
   * @param {DirectiveBinding} binding 一个对象，包含以下属性
   * @param {VNode} vnode 代表绑定元素的底层 VNode
   * @param {VNode} prevNode 代表之前的渲染中指令所绑定元素的 VNode。仅在 beforeUpdate 和 updated 钩子中可用
   */
  created(el: Element, { value, modifiers }: DirectiveBinding) {
    el.addEventListener('click', (e) => {
      if (modifiers.stop) {
        e.stopPropagation()
      }
      if (modifiers.prevent) {
        e.preventDefault()
      }
      if (!value) {
        return
      }
      let backType
      if (modifiers.replace) {
        backType = 'replace'
      } else if (modifiers.push) {
        backType = 'push'
      } else if (modifiers.target_self) {
        backType = 'target_self'
      } else if (modifiers.target_blank) {
        backType = 'target_blank'
      }
      pageBack(value, backType)
    })
  }
}

export const usePageBack = () => {
  const route = useRoute()
  const showBackNav = computed(() => {
    return Boolean(route.meta?.backLink)
  })
  const navTitle: ComputedRef<string> = computed(() => {
    return (route.meta?.title as string) || ''
  })
  const navBack = () => {
    pageBack(route.meta?.backLink as string, route.meta?.backType as string)
  }
  return { showBackNav, navTitle, navBack }
}
export const useMountedAndUnmounted = (funcMounted: () => void, funcUnmounted: () => void) => {
  onMounted(() => {
    funcMounted()
  })
  onBeforeUnmount(() => {
    funcUnmounted()
  })
  onActivated(() => {
    funcMounted()
  })
  onDeactivated(() => {
    funcUnmounted()
  })
}

export const toggleBodyClass = (className: string, force: boolean) => {
  document.body.classList.toggle(className, force)
}

export const useBodyClass = (className: string) => {
  useMountedAndUnmounted(
    () => toggleBodyClass(className, true),
    () => toggleBodyClass(className, false)
  )
}
