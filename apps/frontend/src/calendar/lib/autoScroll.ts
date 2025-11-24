
/**
 * autoScroll
 * ----------
 * Window auto-scroll utility for drag/resize operations. Starts a requestAnimationFrame loop
 * that scrolls the window when the pointer nears the viewport edges.
 *
 * API: const { start, stop } = createAutoScroll(getContainer? -> HTMLElement | null, edgePx?, maxSpeed?)
 * If provided, `getContainer` will be used to discover and scroll the nearest scrollable ancestor
 * of the returned element (useful when the time grid lives in an inner scroll container instead of
 * the window/document).
 */
export function createAutoScroll(getContainer?: () => HTMLElement | null, edge = 28, speed = 20) {
  let autoRaf = 0
  const ptr = { x: 0, y: 0 }
  const onPtrMove = (e: PointerEvent) => { ptr.x = (e as any).clientX; ptr.y = (e as any).clientY }

  // Walk up the DOM from `el` and return the first scrollable ancestor. If none found,
  // fall back to `document.scrollingElement` (which allows window scrolling).
  const findScrollParent = (el: HTMLElement | null): HTMLElement | null => {
    while (el) {
      const style = window.getComputedStyle(el)
      const overflowY = style.overflowY
      if ((overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') && el.scrollHeight > el.clientHeight) return el
      el = el.parentElement
    }
    return (document.scrollingElement as HTMLElement) || null
  }

  const tick = () => {
    const container = getContainer ? findScrollParent(getContainer()) : (document.scrollingElement as HTMLElement | null)
    let yTop = ptr.y
    let yBottom = window.innerHeight - ptr.y
    let rectTop = 0
    let rectBottom = window.innerHeight
    if (container && container !== (document.scrollingElement as HTMLElement)) {
      const r = container.getBoundingClientRect()
      rectTop = r.top
      rectBottom = r.bottom
      yTop = ptr.y - rectTop
      yBottom = rectBottom - ptr.y
    }
    let delta = 0
    if (yTop < edge) delta = -Math.ceil(((edge - yTop) / edge) * speed)
    else if (yBottom < edge) delta = Math.ceil(((edge - yBottom) / edge) * speed)
    if (delta !== 0) {
      if (container && container !== (document.scrollingElement as HTMLElement)) container.scrollBy(0, delta)
      else window.scrollBy(0, delta)
    }
    autoRaf = window.requestAnimationFrame(tick)
  }
  const start = () => {
    if (autoRaf) return
    window.addEventListener('pointermove', onPtrMove)
    autoRaf = window.requestAnimationFrame(tick)
  }
  const stop = () => {
    if (!autoRaf) return
    window.cancelAnimationFrame(autoRaf)
    autoRaf = 0
    window.removeEventListener('pointermove', onPtrMove)
  }
  return { start, stop }
}
