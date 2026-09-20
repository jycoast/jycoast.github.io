import DefaultTheme from 'vitepress/theme'
import './styles/custom.css'

function enhanceBookOutline() {
  if (typeof document === 'undefined') return

  const outline = document.querySelector('.VPDoc .left-aside .VPDocAsideOutline')
  if (!outline) return

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
    toggle.setAttribute('aria-label', `${item.classList.contains('is-collapsed') ? '展开' : '收起'} ${link.textContent?.trim() ?? ''}`)
  })
}

function scheduleOutlineEnhancement() {
  window.requestAnimationFrame(() => {
    enhanceBookOutline()
    window.setTimeout(enhanceBookOutline, 250)
  })
}

export default {
  extends: DefaultTheme,
  enhanceApp({ router }) {
    router.onAfterRouteChanged = (to) => {
      if (typeof window === 'undefined') return
      const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag
      gtag?.('event', 'page_view', {
        page_path: to,
        page_location: window.location.href,
        page_title: document.title,
      })
      scheduleOutlineEnhancement()
    }

    if (typeof window !== 'undefined') {
      window.setTimeout(scheduleOutlineEnhancement, 0)
    }
  },
}
