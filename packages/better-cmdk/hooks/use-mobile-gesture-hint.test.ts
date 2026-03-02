import { expect, test } from "bun:test"
import {
    persistMobileGestureHintDismissed,
    readMobileGestureHintDismissed,
    shouldShowMobileGestureHint,
} from "./use-mobile-gesture-hint"

test("mobile gesture hint defaults to visible when all conditions pass", () => {
    expect(
        shouldShowMobileGestureHint({
            isMobile: true,
            open: false,
            gestureEnabled: true,
            showGestureHint: true,
            dismissed: false,
            showSwipeHint: false,
        }),
    ).toBe(true)
})

test("mobile gesture hint hides when menu is open", () => {
    expect(
        shouldShowMobileGestureHint({
            isMobile: true,
            open: true,
            gestureEnabled: true,
            showGestureHint: true,
            dismissed: false,
            showSwipeHint: false,
        }),
    ).toBe(false)
})

test("mobile gesture hint hides when gesture is disabled", () => {
    expect(
        shouldShowMobileGestureHint({
            isMobile: true,
            open: false,
            gestureEnabled: false,
            showGestureHint: true,
            dismissed: false,
            showSwipeHint: false,
        }),
    ).toBe(false)
})

test("mobile gesture hint hides when explicitly disabled", () => {
    expect(
        shouldShowMobileGestureHint({
            isMobile: true,
            open: false,
            gestureEnabled: true,
            showGestureHint: false,
            dismissed: false,
            showSwipeHint: false,
        }),
    ).toBe(false)
})

test("mobile gesture hint hides after dismissal", () => {
    expect(
        shouldShowMobileGestureHint({
            isMobile: true,
            open: false,
            gestureEnabled: true,
            showGestureHint: true,
            dismissed: true,
            showSwipeHint: false,
        }),
    ).toBe(false)
})

test("mobile gesture hint hides while swipe instruction is shown", () => {
    expect(
        shouldShowMobileGestureHint({
            isMobile: true,
            open: false,
            gestureEnabled: true,
            showGestureHint: true,
            dismissed: false,
            showSwipeHint: true,
        }),
    ).toBe(false)
})

test("readMobileGestureHintDismissed reads the persisted flag", () => {
    expect(
        readMobileGestureHintDismissed({
            getItem(key) {
                return key === "better-cmdk:mobile-gesture-hint-dismissed"
                    ? "true"
                    : null
            },
        }),
    ).toBe(true)
})

test("readMobileGestureHintDismissed handles storage failures", () => {
    expect(
        readMobileGestureHintDismissed({
            getItem() {
                throw new Error("storage blocked")
            },
        }),
    ).toBe(false)
})

test("persistMobileGestureHintDismissed writes the dismissal flag", () => {
    let persisted: string | null = null

    persistMobileGestureHintDismissed({
        setItem(key, value) {
            if (key === "better-cmdk:mobile-gesture-hint-dismissed") {
                persisted = value
            }
        },
    })

    expect(persisted).toBe("true")
})

test("persistMobileGestureHintDismissed ignores storage failures", () => {
    expect(() =>
        persistMobileGestureHintDismissed({
            setItem() {
                throw new Error("storage blocked")
            },
        }),
    ).not.toThrow()
})
