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

    React.useEffect(() => {
        onTriggerRef.current = onTrigger
    }, [onTrigger])

    const clearState = React.useCallback(() => {
        const current = stateRef.current
        if (current?.timer != null) {
            window.clearTimeout(current.timer)
        }
        stateRef.current = null
        setShowHint(false)
    }, [])

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

            // Prevent mobile long-press OS context menus in the gesture zone.
            if (trackingGesture || recentlyTouchedInZone) {
                if (!trackingGesture && isExcludedTarget(event.target)) {
                    return
                }
                event.preventDefault()
            }
        }

        document.addEventListener("touchstart", onTouchStart, { passive: true })
        document.addEventListener("touchmove", onTouchMove, { passive: true })
        document.addEventListener("touchend", onTouchEnd, { passive: true })
        document.addEventListener("touchcancel", onTouchCancel, {
            passive: true,
        })
        document.addEventListener("contextmenu", onContextMenu)

        return () => {
            document.removeEventListener("touchstart", onTouchStart)
            document.removeEventListener("touchmove", onTouchMove)
            document.removeEventListener("touchend", onTouchEnd)
            document.removeEventListener("touchcancel", onTouchCancel)
            document.removeEventListener("contextmenu", onContextMenu)
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
    ])

    return { showHint }
}
