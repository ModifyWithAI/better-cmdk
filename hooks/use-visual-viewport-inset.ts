"use client"

import * as React from "react"

/**
 * Returns the current keyboard/viewport overlap in pixels.
 * Uses VisualViewport when available and falls back to 0.
 */
export function useVisualViewportInset(enabled: boolean): number {
    const [inset, setInset] = React.useState(0)

    React.useEffect(() => {
        if (!enabled || typeof window === "undefined") {
            setInset(0)
            return
        }

        const vv = window.visualViewport
        if (!vv) {
            setInset(0)
            return
        }

        const update = () => {
            const next = Math.max(
                0,
                Math.round(window.innerHeight - vv.height - vv.offsetTop),
            )
            setInset((prev) => (prev === next ? prev : next))
        }

        update()
        vv.addEventListener("resize", update)
        vv.addEventListener("scroll", update)
        window.addEventListener("orientationchange", update)

        return () => {
            vv.removeEventListener("resize", update)
            vv.removeEventListener("scroll", update)
            window.removeEventListener("orientationchange", update)
        }
    }, [enabled])

    return inset
}
