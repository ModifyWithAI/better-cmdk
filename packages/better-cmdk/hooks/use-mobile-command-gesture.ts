"use client"

import * as React from "react"

export interface UseMobileCommandGestureOptions {
    enabled: boolean
    open: boolean
    holdMs: number
    swipeUpPx: number
    onTrigger: () => void
    movementTolerancePx?: number
    horizontalCancelPx?: number
    activationZoneWidthPercent?: number
    activationZoneHeightPercent?: number
    bottomExclusionPx?: number
    rightExclusionPx?: number
}

export interface UseMobileCommandGestureReturn {
    showHint: boolean
}

interface GestureState {
    startX: number
    startY: number
    armed: boolean
    timer: number | null
}

function isExcludedTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false

    if (
        target.closest(
            "input, textarea, select, button, a, [contenteditable='true'], [contenteditable=''], [data-cmdk-mobile-gesture-ignore]",
        )
    ) {
        return true
    }

    return false
}

function isInActivationZone(
    clientX: number,
    clientY: number,
    activationZoneWidthPercent: number,
    activationZoneHeightPercent: number,
    bottomExclusionPx: number,
    rightExclusionPx: number,
): boolean {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const zoneWidth = viewportWidth * activationZoneWidthPercent
    const zoneXEnd = viewportWidth - rightExclusionPx
    const zoneXStart = Math.max(0, zoneXEnd - zoneWidth)

    const zoneYStart = viewportHeight * (1 - activationZoneHeightPercent)
    const zoneYEnd = viewportHeight - bottomExclusionPx

    return (
        clientX >= zoneXStart &&
        clientX <= zoneXEnd &&
        clientY >= zoneYStart &&
        clientY <= zoneYEnd
    )
}

export function useMobileCommandGesture({
    enabled,
    open,
    holdMs,
    swipeUpPx,
    onTrigger,
    movementTolerancePx = 10,
    horizontalCancelPx = 24,
    activationZoneWidthPercent = 0.4,
    activationZoneHeightPercent = 0.4,
    bottomExclusionPx = 8,
    rightExclusionPx = 0,
}: UseMobileCommandGestureOptions): UseMobileCommandGestureReturn {
    const [showHint, setShowHint] = React.useState(false)
    const stateRef = React.useRef<GestureState | null>(null)
    const lastTouchInZoneAtRef = React.useRef(0)
    const onTriggerRef = React.useRef(onTrigger)
    const touchCalloutRestoreRef = React.useRef<{
        applied: boolean
        touchCallout: string
        webkitUserSelect: string
        userSelect: string
    }>({
        applied: false,
        touchCallout: "",
        webkitUserSelect: "",
        userSelect: "",
    })

    React.useEffect(() => {
        onTriggerRef.current = onTrigger
    }, [onTrigger])

    const applyTouchCalloutSuppression = React.useCallback(() => {
        if (typeof document === "undefined") return
        if (touchCalloutRestoreRef.current.applied) return

        const root = document.documentElement
        const { style } = root
        touchCalloutRestoreRef.current = {
            applied: true,
            touchCallout: style.getPropertyValue("-webkit-touch-callout"),
            webkitUserSelect: style.getPropertyValue("-webkit-user-select"),
            userSelect: style.getPropertyValue("user-select"),
        }

        style.setProperty("-webkit-touch-callout", "none")
        style.setProperty("-webkit-user-select", "none")
        style.setProperty("user-select", "none")
    }, [])

    const clearTouchCalloutSuppression = React.useCallback(() => {
        if (typeof document === "undefined") return
        const restore = touchCalloutRestoreRef.current
        if (!restore.applied) return

        const { style } = document.documentElement
        if (restore.touchCallout) {
            style.setProperty("-webkit-touch-callout", restore.touchCallout)
        } else {
            style.removeProperty("-webkit-touch-callout")
        }
        if (restore.webkitUserSelect) {
            style.setProperty("-webkit-user-select", restore.webkitUserSelect)
        } else {
            style.removeProperty("-webkit-user-select")
        }
        if (restore.userSelect) {
            style.setProperty("user-select", restore.userSelect)
        } else {
            style.removeProperty("user-select")
        }

        touchCalloutRestoreRef.current = {
            applied: false,
            touchCallout: "",
            webkitUserSelect: "",
            userSelect: "",
        }
    }, [])

    const clearState = React.useCallback(() => {
        const current = stateRef.current
        if (current?.timer != null) {
            window.clearTimeout(current.timer)
        }
        stateRef.current = null
        setShowHint(false)
        clearTouchCalloutSuppression()
    }, [clearTouchCalloutSuppression])

    React.useEffect(() => {
        if (!enabled || open || typeof window === "undefined") {
            clearState()
            return
        }

        const onTouchStart = (event: TouchEvent) => {
            if (event.touches.length !== 1) return
            if (isExcludedTarget(event.target)) return

            const touch = event.touches[0]
            if (!touch) return

            if (
                !isInActivationZone(
                    touch.clientX,
                    touch.clientY,
                    activationZoneWidthPercent,
                    activationZoneHeightPercent,
                    bottomExclusionPx,
                    rightExclusionPx,
                )
            ) {
                return
            }

            lastTouchInZoneAtRef.current = Date.now()
            // iOS Safari can show native callout/context menus on long press
            // even before our `contextmenu` handler runs.
            applyTouchCalloutSuppression()
            if (event.cancelable) {
                event.preventDefault()
            }

            const timer = window.setTimeout(() => {
                const current = stateRef.current
                if (!current) return
                current.armed = true
                setShowHint(true)
                if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                    navigator.vibrate(6)
                }
            }, holdMs)

            stateRef.current = {
                startX: touch.clientX,
                startY: touch.clientY,
                armed: false,
                timer,
            }
        }

        const onTouchMove = (event: TouchEvent) => {
            if (event.touches.length !== 1) {
                clearState()
                return
            }

            const current = stateRef.current
            if (!current) return
            if (event.cancelable) {
                event.preventDefault()
            }
            const touch = event.touches[0]
            if (!touch) return

            const dx = touch.clientX - current.startX
            const dy = touch.clientY - current.startY

            if (!current.armed) {
                const distance = Math.hypot(dx, dy)
                if (distance > movementTolerancePx) {
                    clearState()
                }
                return
            }

            if (Math.abs(dx) > horizontalCancelPx) {
                clearState()
                return
            }

            if (dy <= -swipeUpPx) {
                clearState()
                if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                    navigator.vibrate(14)
                }
                onTriggerRef.current()
            }
        }

        const onTouchEnd = () => {
            clearState()
        }

        const onTouchCancel = () => {
            clearState()
        }

        const onContextMenu = (event: MouseEvent) => {
            const trackingGesture = stateRef.current !== null
            const recentlyTouchedInZone =
                Date.now() - lastTouchInZoneAtRef.current < holdMs + 1200
            const shouldSuppressByLocation = isInActivationZone(
                event.clientX,
                event.clientY,
                activationZoneWidthPercent,
                activationZoneHeightPercent,
                bottomExclusionPx,
                rightExclusionPx,
            )

            // Prevent mobile long-press OS context menus in the gesture zone.
            if (trackingGesture || (recentlyTouchedInZone && shouldSuppressByLocation)) {
                if (!trackingGesture && isExcludedTarget(event.target)) {
                    return
                }
                event.preventDefault()
                event.stopPropagation()
            }
        }

        document.addEventListener("touchstart", onTouchStart, { passive: false })
        document.addEventListener("touchmove", onTouchMove, { passive: false })
        document.addEventListener("touchend", onTouchEnd, { passive: true })
        document.addEventListener("touchcancel", onTouchCancel, {
            passive: true,
        })
        document.addEventListener("contextmenu", onContextMenu, true)

        return () => {
            document.removeEventListener("touchstart", onTouchStart)
            document.removeEventListener("touchmove", onTouchMove)
            document.removeEventListener("touchend", onTouchEnd)
            document.removeEventListener("touchcancel", onTouchCancel)
            document.removeEventListener("contextmenu", onContextMenu, true)
            clearState()
        }
    }, [
        enabled,
        open,
        holdMs,
        swipeUpPx,
        movementTolerancePx,
        horizontalCancelPx,
        activationZoneWidthPercent,
        activationZoneHeightPercent,
        bottomExclusionPx,
        rightExclusionPx,
        clearState,
        applyTouchCalloutSuppression,
    ])

    return { showHint }
}
