import DefaultTheme from 'vitepress/theme'
import './styles/custom.css'

let outlineFrame = 0
let outlineTimer: ReturnType<typeof setTimeout> | undefined
let outlineIdle: number | undefined
let outlineScheduleVersion = 0

function hideBookOutline() {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('book-outline-pending')
  }
}

function showBookOutline() {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('book-outline-pending')
  }
}

function enhanceBookOutline() {
  if (typeof document === 'undefined') return false

  const outline = document.querySelector('.VPDoc .left-aside .VPDocAsideOutline')
  if (!outline) {
    showBookOutline()
    return false
  }

  outline.querySelectorAll('li').forEach((item) => {
    const directChildren = Array.from(item.children)
    const childList = directChildren.find(
      (child) => child instanceof HTMLUListElement && child.classList.contains('VPDocOutlineItem'),
    ) as HTMLUListElement | undefined
    const link = directChildren.find(
      (child) => child instanceof HTMLAnchorElement && child.classList.contains('outline-link'),
    ) as HTMLAnchorElement | undefined

    if (!link) return

    if (!childList) {
      item.classList.remove('has-children', 'is-collapsed')
      item.querySelector(':scope > .outline-toggle')?.remove()
      return
    }

    item.classList.add('has-children')

    let toggle = item.querySelector(':scope > .outline-toggle') as HTMLButtonElement | null
    if (!toggle) {
      toggle = document.createElement('button')
      toggle.type = 'button'
      toggle.className = 'outline-toggle'
      toggle.innerHTML = '<span aria-hidden="true">›</span>'
      toggle.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
        const collapsed = item.classList.toggle('is-collapsed')
        toggle?.setAttribute('aria-expanded', String(!collapsed))
      })
      item.insertBefore(toggle, link)
    }

    if (!item.dataset.outlineReady) {
      item.dataset.outlineReady = 'true'
      const headingId = decodeURIComponent(link.hash.slice(1))
      const heading = document.getElementById(headingId)
      const headingLevel = heading ? Number(heading.tagName.slice(1)) : 1
      item.classList.toggle('is-collapsed', headingLevel >= 2)
    }

    toggle.setAttribute('aria-expanded', String(!item.classList.contains('is-collapsed')))
    toggle.setAttribute(
      'aria-label',
      `${item.classList.contains('is-collapsed') ? '展开' : '收起'} ${link.textContent?.trim() ?? ''}`,
    )
  })

  showBookOutline()
  return true
}

function cancelOutlineSchedule() {
  if (typeof window === 'undefined') return
  outlineScheduleVersion += 1
  if (outlineFrame) {
    window.cancelAnimationFrame(outlineFrame)
    outlineFrame = 0
  }
  if (outlineTimer) {
    window.clearTimeout(outlineTimer)
    outlineTimer = undefined
  }
  const cancelIdle = (window as typeof window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback
  if (outlineIdle !== undefined && cancelIdle) {
    cancelIdle.call(window, outlineIdle)
  }
  outlineIdle = undefined
}

function scheduleOutlineEnhancement() {
  if (typeof window === 'undefined') return
  cancelOutlineSchedule()
  const scheduleVersion = outlineScheduleVersion

  outlineFrame = window.requestAnimationFrame(() => {
    outlineFrame = 0
    if (scheduleVersion !== outlineScheduleVersion) return
    if (enhanceBookOutline()) return

    const runLater = () => {
      outlineIdle = undefined
      outlineTimer = undefined
      if (scheduleVersion === outlineScheduleVersion) enhanceBookOutline()
    }
    const idle = (window as typeof window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
    }).requestIdleCallback

    if (idle) outlineIdle = idle.call(window, runLater, { timeout: 500 })
    else outlineTimer = window.setTimeout(runLater, 120)
  })
}

export default {
  extends: DefaultTheme,
  enhanceApp({ router }) {
    const previousBeforeRouteChange = router.onBeforeRouteChange
    router.onBeforeRouteChange = async (to) => {
      const result = await previousBeforeRouteChange?.(to)
      if (result === false) return false
      cancelOutlineSchedule()
      hideBookOutline()
    }

    router.onAfterRouteChange = (to) => {
      scheduleOutlineEnhancement()
      if (typeof window === 'undefined') return
      const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag
      gtag?.('event', 'page_view', {
        page_path: to,
        page_location: window.location.href,
        page_title: document.title,
      })
    }

    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(scheduleOutlineEnhancement)
    }
  },
}
