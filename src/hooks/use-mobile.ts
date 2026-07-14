import * as React from "react"

const MOBILE_BREAKPOINT = 768
const REDUCED_GRAPHICS_QUERY = `(max-width: ${MOBILE_BREAKPOINT}px), (hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)`

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(() =>
    typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
  )

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useReducedGraphics() {
  const [shouldReduce, setShouldReduce] = React.useState(() =>
    typeof window !== "undefined" && window.matchMedia(REDUCED_GRAPHICS_QUERY).matches
  )

  React.useEffect(() => {
    const mql = window.matchMedia(REDUCED_GRAPHICS_QUERY)
    const onChange = () => setShouldReduce(mql.matches)
    mql.addEventListener("change", onChange)
    onChange()
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return shouldReduce
}
