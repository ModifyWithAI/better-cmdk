"use client"

import * as React from "react"

export const MOBILE_GESTURE_HINT_DISMISSED_STORAGE_KEY =
    "better-cmdk:mobile-gesture-hint-dismissed"

export function shouldShowMobileGestureHint({
    isMobile,
    open,
    gestureEnabled,
    showGestureHint,
    dismissed,
    showSwipeHint,
}: {
    isMobile: boolean
    open: boolean
    gestureEnabled: boolean
    showGestureHint: boolean
    dismissed: boolean
    showSwipeHint: boolean
}) {
    return (
        isMobile &&
        !open &&
        gestureEnabled &&
        showGestureHint &&
        !dismissed &&
        !showSwipeHint
    )
}

export function readMobileGestureHintDismissed(
    storage: Pick<Storage, "getItem"> | null | undefined,
) {
    if (!storage) return false

    try {
        return (
            storage.getItem(MOBILE_GESTURE_HINT_DISMISSED_STORAGE_KEY) === "true"
        )
    } catch {
        return false
    }
}

export function persistMobileGestureHintDismissed(
    storage: Pick<Storage, "setItem"> | null | undefined,
) {
    if (!storage) return

    try {
        storage.setItem(MOBILE_GESTURE_HINT_DISMISSED_STORAGE_KEY, "true")
    } catch {}
}

function getLocalStorage(): Storage | null {
    if (typeof window === "undefined") return null

    try {
        return window.localStorage
    } catch {
        return null
    }
}

export function useMobileGestureHint({
    isMobile,
    open,
    gestureEnabled,
    showGestureHint,
    showSwipeHint,
}: Omit<Parameters<typeof shouldShowMobileGestureHint>[0], "dismissed">) {
    const [dismissed, setDismissed] = React.useState(false)
    const [hasLoadedDismissalState, setHasLoadedDismissalState] =
        React.useState(false)

    React.useEffect(() => {
        setDismissed(readMobileGestureHintDismissed(getLocalStorage()))
        setHasLoadedDismissalState(true)
    }, [])

    React.useEffect(() => {
        if (!isMobile || !open || !gestureEnabled || !showGestureHint) return
        if (dismissed === true) return

        persistMobileGestureHintDismissed(getLocalStorage())
        setDismissed(true)
    }, [dismissed, gestureEnabled, isMobile, open, showGestureHint])

    if (!hasLoadedDismissalState) return false

    return shouldShowMobileGestureHint({
        isMobile,
        open,
        gestureEnabled,
        showGestureHint,
        dismissed,
        showSwipeHint,
    })
}
