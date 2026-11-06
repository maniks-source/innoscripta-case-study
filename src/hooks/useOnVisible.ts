import { useEffect, useRef } from 'react'

export function useOnVisible(onVisible: () => void, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled) return
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onVisible()
      },
      { rootMargin: '640px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [enabled, onVisible])

  return ref
}
