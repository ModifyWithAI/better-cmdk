"use client"

import type { UIMessage } from "ai"
import {
    Command as CommandPrimitive,
    defaultFilter,
    useCommandState,
} from "../../lib/cmdk"
import {
    ArrowUpIcon,
    KeyboardIcon,
    MessageCircleIcon,
} from "lucide-react"
import { motion } from "motion/react"
import { Dialog as DialogPrimitive } from "radix-ui"
import * as React from "react"
import {
    type CommandMenuMode,
    CommandMenuProvider,
    type ExternalChat,
    useCommandMenuContext,
} from "../../context/command-menu-context"
import { cn } from "../../lib/utils"
import { AssistantMessages } from "./assistant-messages"
import { ChatEmpty, ChatLoading, ChatMessageList } from "./chat"
import {
    CommandGroup,
    CommandItem,
    CommandShortcut,
    CommandEmpty as ShadcnCommandEmpty,
} from "./command"
import { Kbd } from "./kbd"
import {
    Dialog,
    DialogDescription,
    DialogHeader,
    DialogPortal,
    DialogTitle,
} from "./dialog"
import { TelemetryErrorBoundary } from "./telemetry-error-boundary"
import { useMobileCommandGesture } from "../../hooks/use-mobile-command-gesture"
import { useVisualViewportInset } from "../../hooks/use-visual-viewport-inset"

const noopApproval = (_r: { id: string; approved: boolean }) => {}

export type CommandMenuCorners = "none" | "sm" | "md" | "lg" | "xl"

const cornersMap: Record<CommandMenuCorners, string> = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
}

const cornersValueMap: Record<CommandMenuCorners, string> = {
    none: "0px",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
}

export type CommandMenuMobileLayout = "keyboard-last"

export interface CommandMenuMobileGesture {
    /** Enables/disables the long-press gesture trigger. */
    enabled?: boolean
    /** Hold duration before showing the swipe-up hint. */
    holdMs?: number
    /** Upward drag distance required to open the menu. */
    swipeUpPx?: number
}

export interface CommandMenuMobileOptions {
    /** Enable mobile command-sheet behavior. Defaults to true. */
    enabled?: boolean
    /** Viewport width threshold used for mobile layout detection. */
    breakpoint?: number
    /** Mobile interaction layout. */
    layout?: CommandMenuMobileLayout
    /** Gesture trigger settings. Set false to fully disable. */
    gesture?: CommandMenuMobileGesture | false
    /** Show quick actions when query is empty. */
    showQuickActions?: boolean
    /** Maximum quick actions to show. */
    quickActionsCount?: number
}

interface ResolvedMobileConfig {
    enabled: boolean
    breakpoint: number
    layout: CommandMenuMobileLayout
    gesture: {
        enabled: boolean
        holdMs: number
        swipeUpPx: number
    }
    showQuickActions: boolean
    quickActionsCount: number
}

interface MobileUIContextValue {
    isMobile: boolean
    layout: CommandMenuMobileLayout
    keyboardInset: number
    showQuickActions: boolean
    quickActionsCount: number
}

const DEFAULT_MOBILE_BREAKPOINT = 900

const defaultMobileUIContext: MobileUIContextValue = {
    isMobile: false,
    layout: "keyboard-last",
    keyboardInset: 0,
    showQuickActions: false,
    quickActionsCount: 4,
}

const MobileUIContext = React.createContext<MobileUIContextValue>(
    defaultMobileUIContext,
)

function useMobileUIContext() {
    return React.useContext(MobileUIContext)
}

function resolveMobileConfig(mobile?: CommandMenuMobileOptions): ResolvedMobileConfig {
    const gestureEnabled = mobile?.gesture !== false
    const gestureOptions = mobile?.gesture === false ? undefined : mobile?.gesture

    return {
        enabled: mobile?.enabled ?? true,
        breakpoint: mobile?.breakpoint ?? DEFAULT_MOBILE_BREAKPOINT,
        layout: mobile?.layout ?? "keyboard-last",
        gesture: {
            enabled: gestureEnabled
                ? (gestureOptions?.enabled ?? true)
                : false,
            holdMs: gestureEnabled ? (gestureOptions?.holdMs ?? 350) : 350,
            swipeUpPx: gestureEnabled
                ? (gestureOptions?.swipeUpPx ?? 56)
                : 56,
        },
        showQuickActions: mobile?.showQuickActions ?? true,
        quickActionsCount: mobile?.quickActionsCount ?? 4,
    }
}

function useIsLikelyMobile(breakpoint: number, enabled: boolean): boolean {
    const [isMobile, setIsMobile] = React.useState(false)

    React.useEffect(() => {
        if (!enabled || typeof window === "undefined") {
            setIsMobile(false)
            return
        }

        const widthMedia = window.matchMedia(`(max-width: ${breakpoint}px)`)
        const coarsePointerMedia = window.matchMedia("(pointer: coarse)")

        const update = () => {
            setIsMobile(widthMedia.matches || coarsePointerMedia.matches)
        }

        update()
        widthMedia.addEventListener("change", update)
        coarsePointerMedia.addEventListener("change", update)
        window.addEventListener("orientationchange", update)

        return () => {
            widthMedia.removeEventListener("change", update)
            coarsePointerMedia.removeEventListener("change", update)
            window.removeEventListener("orientationchange", update)
        }
    }, [breakpoint, enabled])

    return isMobile
}

function formatRelativeTime(timestamp: number): string {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
}

interface CommandMenuProps
    extends Omit<React.ComponentProps<typeof Dialog>, "children"> {
    title?: string
    description?: string
    className?: string
    corners?: CommandMenuCorners
    borderColor?: string
    chatEndpoint?: string | null
    chat?: ExternalChat
    askAILabel?: string
    onModeChange?: (mode: CommandMenuMode) => void
    historyStorageKey?: string
    maxConversations?: number
    /** Mobile-specific interaction + layout settings. */
    mobile?: CommandMenuMobileOptions
    /** Declarative command definitions. Mutually exclusive with children. */
    commands?: CommandDefinition[]
    /** Placeholder for the command input when using `commands` prop. */
    commandsPlaceholder?: string
    /** Label for the "Ask AI" trigger when using `commands` prop. */
    commandsAskAILabel?: string
    children?:
        | React.ReactNode
        | ((context: {
              mode: CommandMenuMode
              messages: UIMessage[]
              status: "idle" | "submitted" | "streaming" | "error"
              isEnabled: boolean
          }) => React.ReactNode)
}

function CommandContent({
    className,
    children,
    corners = "xl",
    borderColor,
    isMobile,
    keyboardInset,
    onRequestClose,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
    corners?: CommandMenuCorners
    borderColor?: string
    isMobile?: boolean
    keyboardInset?: number
    onRequestClose?: () => void
}) {
    const swipeStartRef = React.useRef<{ x: number; y: number } | null>(null)

    const dismissOrClose = React.useCallback(() => {
        if (typeof document === "undefined") return
        const activeElement = document.activeElement
        if (
            activeElement instanceof HTMLElement &&
            activeElement.hasAttribute("cmdk-input")
        ) {
            activeElement.blur()
            return
        }
        onRequestClose?.()
    }, [onRequestClose])

    const handleDragHandleTouchStart = (
        event: React.TouchEvent<HTMLDivElement>,
    ) => {
        if (event.touches.length !== 1) return
        const touch = event.touches[0]
        if (!touch) return
        swipeStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
        }
    }

    const handleDragHandleTouchEnd = (
        event: React.TouchEvent<HTMLDivElement>,
    ) => {
        const start = swipeStartRef.current
        swipeStartRef.current = null
        if (!start || event.changedTouches.length === 0) return

        const touch = event.changedTouches[0]
        if (!touch) return
        const dx = touch.clientX - start.x
        const dy = touch.clientY - start.y

        if (dy > 56 && Math.abs(dx) < 42) {
            dismissOrClose()
        }
    }

    return (
        <DialogPortal data-slot="dialog-portal">
            <div className="bcmdk-root">
                {isMobile && (
                    <DialogPrimitive.Overlay
                        className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 40,
                            backgroundColor: "rgb(0 0 0 / 0.35)",
                            backdropFilter: "blur(1px)",
                            WebkitBackdropFilter: "blur(1px)",
                        }}
                    />
                )}
                <div
                    className={cn(
                        "fixed z-50 w-full max-w-[calc(100%-2rem)]",
                        isMobile
                            ? "inset-x-0 bottom-0 max-w-none px-0"
                            : "top-1/3 left-[50%] translate-x-[-50%] translate-y-[-50%]",
                    )}
                    style={
                        isMobile
                            ? ({
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  maxWidth: "none",
                                  paddingLeft: 0,
                                  paddingRight: 0,
                              } as React.CSSProperties)
                            : ({ maxWidth: "45vw" } as React.CSSProperties)
                    }
                >
                    <DialogPrimitive.Content
                        data-slot="dialog-content"
                        className={cn(
                            "backdrop-blur-xl flex flex-col w-full overflow-hidden border border-input p-0 ring-0 outline-none",
                            isMobile
                                ? "border-x-0 border-b-0 will-change-transform data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom-8 data-[state=open]:slide-in-from-bottom-8 data-[state=open]:duration-300 data-[state=closed]:duration-200"
                                : cornersMap[corners],
                            className,
                        )}
                        style={
                            {
                                "--cmdk-radius": cornersValueMap[corners],
                                "--cmdk-mobile-keyboard-inset": `${keyboardInset ?? 0}px`,
                                "--cmdk-mobile-sheet-top-inset":
                                    "max(11rem, calc(env(safe-area-inset-top) + 8rem))",
                                maxHeight: isMobile
                                    ? "calc(100dvh - var(--cmdk-mobile-sheet-top-inset))"
                                    : "45vh",
                                height: isMobile
                                    ? "calc(100dvh - var(--cmdk-mobile-sheet-top-inset))"
                                    : undefined,
                                ...(isMobile
                                    ? {
                                          borderTopLeftRadius: cornersValueMap[corners],
                                          borderTopRightRadius: cornersValueMap[corners],
                                          borderBottomLeftRadius: "0px",
                                          borderBottomRightRadius: "0px",
                                      }
                                    : {}),
                                backgroundColor:
                                    "color-mix(in oklch, oklch(var(--bcmdk-background)) 95%, transparent)",
                                boxShadow: "4px 4px 12px -2px rgba(0,0,0,0.12), -4px 4px 12px -2px rgba(0,0,0,0.12), 0 8px 16px -4px rgba(0,0,0,0.1)",
                                ...(borderColor
                                    ? { "--tw-ring-color": borderColor }
                                    : {}),
                            } as React.CSSProperties
                        }
                        {...props}
                    >
                        {isMobile && (
                            <div
                                className="flex justify-center py-2"
                                data-cmdk-mobile-gesture-ignore
                                onTouchStart={handleDragHandleTouchStart}
                                onTouchEnd={handleDragHandleTouchEnd}
                            >
                                <div className="h-1.5 w-11 rounded-full bg-muted-foreground/35" />
                            </div>
                        )}
                        {children}
                    </DialogPrimitive.Content>
                    <div
                        className={cn(
                            "flex justify-end select-none",
                            isMobile && "hidden",
                        )}
                    >
                        <a href="https://better-cmdk.com" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground font-medium px-2 py-0.5 hover:text-foreground transition-colors" style={{ borderRadius: "0 0 0.375rem 0.375rem", marginRight: "1rem", backgroundColor: "color-mix(in oklch, oklch(var(--bcmdk-background)) 95%, transparent)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderLeft: "1px solid oklch(var(--bcmdk-input))", borderRight: "1px solid oklch(var(--bcmdk-input))", borderBottom: "1px solid oklch(var(--bcmdk-input))", boxShadow: "4px 4px 12px -2px rgba(0,0,0,0.12), -4px 4px 12px -2px rgba(0,0,0,0.12), 0 8px 16px -4px rgba(0,0,0,0.1)" }}>
                            powered by better-cmdk
                        </a>
                    </div>
                </div>
            </div>
        </DialogPortal>
    )
}

const defaultChildren = (
    <>
        <CommandInput placeholder="Search for commands or ask AI..." showSendButton />
        <CommandList>
            <CommandEmpty />
        </CommandList>
    </>
)

function CommandMenuInner({
    title = "Command Palette",
    description = "Search for a command to run...",
    children,
    className,
    corners = "xl",
    borderColor,
    commands,
    commandsPlaceholder = "Search for commands or ask AI...",
    commandsAskAILabel = "Ask AI",
    mobile,
    ...props
}: Omit<CommandMenuProps, "chatEndpoint" | "chat" | "onModeChange">) {
    const {
        mode,
        status,
        switchToCommand,
        messages,
        isEnabled,
        setInputValue,
        inputValue,
    } = useCommandMenuContext()

    const mobileConfig = React.useMemo(
        () => resolveMobileConfig(mobile),
        [mobile],
    )
    const isLikelyMobile = useIsLikelyMobile(
        mobileConfig.breakpoint,
        mobileConfig.enabled,
    )
    const isMobileSheet = mobileConfig.enabled && isLikelyMobile
    const keyboardInset = useVisualViewportInset(isMobileSheet && !!props.open)

    const handleOpenChange = React.useCallback(
        (open: boolean) => {
            if (open) setInputValue("")
            props.onOpenChange?.(open)
        },
        [props.onOpenChange, setInputValue],
    )
    const handleGestureTrigger = React.useCallback(() => {
        handleOpenChange(true)
    }, [handleOpenChange])

    const gesture = useMobileCommandGesture({
        enabled:
            isMobileSheet &&
            !props.open &&
            Boolean(props.onOpenChange) &&
            mobileConfig.gesture.enabled,
        open: Boolean(props.open),
        holdMs: mobileConfig.gesture.holdMs,
        swipeUpPx: mobileConfig.gesture.swipeUpPx,
        onTrigger: handleGestureTrigger,
    })

    const mobileUI = React.useMemo<MobileUIContextValue>(
        () => ({
            isMobile: isMobileSheet,
            layout: mobileConfig.layout,
            keyboardInset,
            showQuickActions: mobileConfig.showQuickActions,
            quickActionsCount: mobileConfig.quickActionsCount,
        }),
        [
            isMobileSheet,
            mobileConfig.layout,
            keyboardInset,
            mobileConfig.showQuickActions,
            mobileConfig.quickActionsCount,
        ],
    )

    const renderChildren = () => {
        // Declarative commands prop takes precedence
        if (commands && commands.length > 0) {
            if (children && process.env.NODE_ENV !== "production") {
                console.warn(
                    "[CommandMenu] Both `commands` and `children` were provided. `commands` takes precedence; `children` will be ignored.",
                )
            }
            return (
                <CommandListFromDefinitions
                    commands={commands}
                    placeholder={commandsPlaceholder}
                    askAILabel={commandsAskAILabel}
                />
            )
        }
        if (typeof children === "function") {
            return children({
                mode,
                messages,
                status,
                isEnabled,
            })
        }
        return children ?? defaultChildren
    }

    const handleEscapeKeyDown = (e: KeyboardEvent) => {
        if (mode === "chat") {
            e.preventDefault()
            switchToCommand()
        }
    }

    React.useEffect(() => {
        const down = (e: globalThis.KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                handleOpenChange(false)
            }
        }
        if (props.open) {
            document.addEventListener("keydown", down)
            return () => document.removeEventListener("keydown", down)
        }
    }, [props.open, handleOpenChange])

    return (
        <>
            <Dialog {...props} onOpenChange={handleOpenChange}>
                <CommandContent
                    className={className}
                    corners={corners}
                    borderColor={borderColor}
                    isMobile={isMobileSheet}
                    keyboardInset={keyboardInset}
                    onRequestClose={() => handleOpenChange(false)}
                    onEscapeKeyDown={handleEscapeKeyDown}
                    onOpenAutoFocus={(event) => {
                        if (
                            isMobileSheet &&
                            mobileConfig.layout === "keyboard-last"
                        ) {
                            event.preventDefault()
                        }
                    }}
                >
                    <DialogHeader className="sr-only">
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    <MobileUIContext.Provider value={mobileUI}>
                        <CommandPrimitive
                            data-slot="command"
                            className={cn(
                                "bcmdk-root **:data-[slot=command-input-wrapper]:bg-transparent rounded-none bg-transparent **:data-[slot=command-input]:!h-11 **:data-[slot=command-input]:py-0 **:data-[slot=command-input-wrapper]:mb-0",
                                isMobileSheet
                                    ? "**:data-[slot=command-input-wrapper]:!h-[var(--cmdk-input-row-height)] pb-[env(safe-area-inset-bottom)]"
                                    : "**:data-[slot=command-input-wrapper]:!h-11",
                                "text-popover-foreground flex h-full min-h-0 w-full flex-col overflow-hidden",
                            )}
                            style={
                                {
                                    borderRadius: "var(--cmdk-radius, 0.75rem)",
                                    "--cmdk-item-height": isMobileSheet
                                        ? "3.125rem"
                                        : "2.25rem",
                                    "--cmdk-input-row-height": isMobileSheet
                                        ? "3.5rem"
                                        : "2.75rem",
                                } as React.CSSProperties
                            }
                        >
                            {renderChildren()}
                        </CommandPrimitive>
                    </MobileUIContext.Provider>
                </CommandContent>
            </Dialog>
            {gesture.showHint && (
                <div
                    className="fixed left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-input bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-md"
                    style={{
                        bottom: "calc(env(safe-area-inset-bottom) + 2rem)",
                    }}
                    data-cmdk-mobile-gesture-ignore
                >
                    <ArrowUpIcon className="size-3.5" />
                    Swipe up for Command Menu
                </div>
            )}
        </>
    )
}

function CommandMenu({
    chatEndpoint = null,
    chat,
    onModeChange,
    onOpenChange,
    historyStorageKey,
    maxConversations,
    commands,
    commandsPlaceholder,
    commandsAskAILabel,
    mobile,
    ...props
}: CommandMenuProps) {
    return (
        <CommandMenuProvider
            chatEndpoint={chatEndpoint}
            chat={chat}
            onModeChange={onModeChange}
            onOpenChange={onOpenChange}
            historyStorageKey={historyStorageKey}
            maxConversations={maxConversations}
        >
            <TelemetryErrorBoundary>
                <CommandMenuInner
                    onOpenChange={onOpenChange}
                    commands={commands}
                    commandsPlaceholder={commandsPlaceholder}
                    commandsAskAILabel={commandsAskAILabel}
                    mobile={mobile}
                    {...props}
                />
            </TelemetryErrorBoundary>
        </CommandMenuProvider>
    )
}

interface CommandInputProps
    extends Omit<
        React.ComponentProps<typeof CommandPrimitive.Input>,
        "value" | "onValueChange"
    > {
    showSendButton?: boolean
}

function CommandInput({
    className,
    showSendButton = false,
    ...props
}: CommandInputProps) {
    const {
        mode,
        inputValue,
        setInputValue,
        sendMessage,
        isLoading,
        switchToChat,
        startNewChat,
    } = useCommandMenuContext()
    const { isMobile, layout, keyboardInset } = useMobileUIContext()
    const [isFocused, setIsFocused] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleSend = () => {
        if (inputValue.trim() && mode === "chat") {
            sendMessage(inputValue)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Cmd+Enter or Ctrl+Enter to start chat mode
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault()
            if (mode === "command" && inputValue.trim()) {
                startNewChat()
                switchToChat()
                sendMessage(inputValue)
            } else if (mode === "chat" && inputValue.trim()) {
                sendMessage(inputValue)
            }
            return
        }

        // Enter in chat mode sends message
        if (mode === "chat" && e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            if (inputValue.trim()) {
                sendMessage(inputValue)
            }
            return
        }
    }

    const showList =
        mode === "chat" ||
        inputValue.length > 0 ||
        (isMobile && layout === "keyboard-last")

    const showKeyboardButton =
        isMobile &&
        layout === "keyboard-last" &&
        !isFocused &&
        mode === "command"

    const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true)
        props.onFocus?.(event)
    }

    const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false)
        props.onBlur?.(event)
    }

    const wrapperStyle = isMobile
        ? ({
              marginBottom:
                  keyboardInset > 0 ? `${keyboardInset}px` : undefined,
          } as React.CSSProperties)
        : undefined

    const inputProps = {
        ...props,
        onFocus: handleInputFocus,
        onBlur: handleInputBlur,
    }

    return (
        <div
            data-slot="command-input-wrapper"
            className={cn(
                "order-2 flex h-[var(--cmdk-input-row-height,2.75rem)] items-center gap-2 px-6 transition-[margin,border-color] duration-200",
                isMobile && "px-4",
                showList ? "border-t border-input mt-0" : "border-t border-transparent mt-0",
            )}
            style={wrapperStyle}
        >
            <CommandPrimitive.Input
                data-slot="command-input"
                ref={inputRef}
                value={inputValue}
                onValueChange={setInputValue}
                onKeyDown={handleKeyDown}
                className={cn(
                    "placeholder:text-muted-foreground flex h-10 w-full appearance-none border-0 bg-transparent py-3 text-sm shadow-none outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                {...inputProps}
                placeholder={mode === "chat" ? "Ask AI..." : props.placeholder}
            />
            {showKeyboardButton && (
                <button
                    type="button"
                    onClick={() => inputRef.current?.focus()}
                    className="flex items-center justify-center size-7 shrink-0 border border-input bg-background text-muted-foreground hover:text-foreground transition-colors"
                    style={{ borderRadius: "var(--cmdk-radius, 0.75rem)" }}
                    aria-label="Type a command"
                    data-cmdk-mobile-gesture-ignore
                >
                    <KeyboardIcon className="size-4" />
                </button>
            )}
            {showSendButton && mode === "chat" && (
                <button
                    type="button"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className="flex items-center justify-center size-6 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{ borderRadius: "var(--cmdk-radius, 0.75rem)" }}
                >
                    <ArrowUpIcon className="size-3" />
                </button>
            )}
        </div>
    )
}

interface CommandEmptyProps
    extends React.ComponentProps<typeof CommandPrimitive.Item> {
    label?: string
    description?: string
}

function CommandEmpty({
    label = "Ask AI",
    className,
    ...props
}: CommandEmptyProps) {
    const {
        inputValue,
        setInputValue,
        switchToChat,
        sendMessage,
        isEnabled,
        startNewChat,
    } = useCommandMenuContext()
    const { isMobile } = useMobileUIContext()

    // cmdk's filtered.count excludes forceMount items (like ask-ai), so
    // count === 0 means no regular commands matched the search query.
    const filteredCount = useCommandState((state) => state.filtered.count)

    const handleAskAI = () => {
        if (!isEnabled) return
        if (inputValue.trim()) {
            const inputMatchesAskAI =
                defaultFilter("ask-ai", inputValue.trim()) > 0
            if (filteredCount === 0 && !inputMatchesAskAI) {
                startNewChat()
                switchToChat()
                sendMessage(inputValue)
            } else {
                switchToChat()
                setInputValue("")
            }
        } else {
            switchToChat()
        }
    }

    if (!isEnabled) {
        return (
            <CommandPrimitive.Empty
                data-slot="command-empty"
                className={cn(
                    "text-muted-foreground py-6 text-center text-sm",
                    className,
                )}
            >
                No results found.
            </CommandPrimitive.Empty>
        )
    }

    return (
        <CommandPrimitive.Group forceMount>
            <CommandPrimitive.Item
                data-slot="command-item"
                value="ask-ai"
                onSelect={handleAskAI}
                className={cn(
                    "data-[selected=true]:border-input data-[selected=true]:bg-input/50 relative flex cursor-default items-center gap-3 border border-transparent px-3 py-2 text-sm outline-hidden select-none",
                    isMobile && "min-h-12 py-3",
                    className,
                )}
                style={{ borderRadius: "var(--cmdk-radius, 0.75rem)" }}
                {...props}
            >
                <MessageCircleIcon className="size-4 shrink-0 text-primary" />
                <div className="flex flex-col items-start gap-0.5">
                    <span className="font-medium">{label}</span>
                </div>
                {!isMobile && (
                    <span className="ml-auto flex items-center gap-1">
                        <Kbd>⌘</Kbd>
                        <Kbd>↵</Kbd>
                    </span>
                )}
            </CommandPrimitive.Item>
        </CommandPrimitive.Group>
    )
}

/**
 * Describes a single option/parameter for an action.
 * Compatible with ActionOption from modifywithai.
 */
export interface CommandActionOption {
    type: "string" | "number" | "boolean"
    description?: string
    required?: boolean
}

type CommandActionExecuteHandler<TOptions> = {
    bivarianceHack(options: TOptions): void
}["bivarianceHack"]

/**
 * Minimal action interface compatible with ActionDefinition from modifywithai.
 * Used as read-only metadata for rendering action items in the command list.
 * `execute` is kept for compatibility but is not invoked by better-cmdk.
 */
export interface CommandAction {
    name: string
    label?: string
    options?: Partial<Record<string, CommandActionOption>>
    execute?: CommandActionExecuteHandler<Record<string, unknown>>
}

/**
 * Declarative command definition for the `commands` prop.
 * Named CommandDefinition to avoid collision with cmdk's Command component.
 */
export interface CommandDefinition {
    /** Unique key used as cmdk value */
    name: string
    /** Display text (falls back to name) */
    label?: string
    /** Group heading — commands with the same string appear in the same group */
    group?: string
    /** Icon rendered before the label */
    icon?: React.ReactNode
    /** Display-only shortcut hint (right-aligned) */
    shortcut?: string
    /** Extra cmdk search terms */
    keywords?: string[]
    /** Grayed out, not selectable */
    disabled?: boolean
    /** Called when the command is selected */
    onSelect?: () => void
}

/**
 * Groups commands by their `group` field, preserving encounter order.
 * Ungrouped commands (no `group`) come first with no heading.
 */
function groupCommands(
    commands: CommandDefinition[],
): { heading: string | undefined; items: CommandDefinition[] }[] {
    const groups: {
        heading: string | undefined
        items: CommandDefinition[]
    }[] = []
    const seen = new Map<string | undefined, number>()

    for (const cmd of commands) {
        const key = cmd.group
        const idx = seen.get(key)
        if (idx !== undefined) {
            groups[idx]!.items.push(cmd)
        } else {
            seen.set(key, groups.length)
            groups.push({ heading: key, items: [cmd] })
        }
    }

    // Move ungrouped (heading === undefined) to the front
    const ungroupedIdx = groups.findIndex((g) => g.heading === undefined)
    if (ungroupedIdx > 0) {
        const ungrouped = groups.splice(ungroupedIdx, 1)[0]!
        groups.unshift(ungrouped)
    }

    return groups
}

/**
 * Internal component that renders a CommandDefinition[] as grouped CommandItems.
 */
function CommandListFromDefinitions({
    commands,
    placeholder,
    askAILabel,
}: {
    commands: CommandDefinition[]
    placeholder: string
    askAILabel: string
}) {
    // Dev-mode duplicate name detection
    if (process.env.NODE_ENV !== "production") {
        const names = new Set<string>()
        for (const cmd of commands) {
            if (names.has(cmd.name)) {
                console.warn(
                    `[CommandMenu] Duplicate command name "${cmd.name}" in commands prop. Names must be unique.`,
                )
            }
            names.add(cmd.name)
        }
    }

    const { inputValue, mode } = useCommandMenuContext()
    const { isMobile, layout, showQuickActions, quickActionsCount } =
        useMobileUIContext()
    const grouped = groupCommands(commands)
    const showQuickActionsGroup =
        isMobile &&
        layout === "keyboard-last" &&
        showQuickActions &&
        mode === "command" &&
        inputValue.length === 0

    const quickActions = showQuickActionsGroup
        ? commands.filter((cmd) => !cmd.disabled).slice(0, quickActionsCount)
        : []

    const quickActionSet = new Set(quickActions.map((cmd) => cmd.name))

    const renderCommandItem = (cmd: CommandDefinition) => {
        const label = cmd.label ?? cmd.name
        // Merge keywords: include label (if different from name) plus explicit keywords
        const allKeywords: string[] = [...(cmd.keywords ?? [])]
        if (cmd.label && cmd.label !== cmd.name) {
            allKeywords.push(cmd.label)
        }

        return (
            <CommandItem
                key={cmd.name}
                value={cmd.name}
                keywords={allKeywords.length > 0 ? allKeywords : undefined}
                disabled={cmd.disabled}
                onSelect={() => cmd.onSelect?.()}
                className={cn(isMobile && "min-h-12 py-3")}
            >
                {cmd.icon}
                {label}
                {cmd.shortcut && !isMobile && (
                    <CommandShortcut>{cmd.shortcut}</CommandShortcut>
                )}
            </CommandItem>
        )
    }

    return (
        <>
            <CommandInput placeholder={placeholder} showSendButton />
            <CommandList>
                {showQuickActionsGroup && quickActions.length > 0 && (
                    <CommandGroup heading="Quick Actions">
                        {quickActions.map((cmd) => renderCommandItem(cmd))}
                    </CommandGroup>
                )}
                {grouped.map((group, gi) => {
                    const visibleItems = showQuickActionsGroup
                        ? group.items.filter((cmd) => !quickActionSet.has(cmd.name))
                        : group.items

                    if (visibleItems.length === 0) {
                        return null
                    }

                    const items = visibleItems.map((cmd) => renderCommandItem(cmd))

                    if (group.heading) {
                        return (
                            <CommandGroup
                                key={group.heading}
                                heading={group.heading}
                            >
                                {items}
                            </CommandGroup>
                        )
                    }
                    // Ungrouped: render items directly (wrapped in a fragment for key)
                    return (
                        <React.Fragment key={`__ungrouped_${gi}`}>
                            {items}
                        </React.Fragment>
                    )
                })}
                <CommandEmpty label={askAILabel} />
            </CommandList>
        </>
    )
}

interface CommandListProps
    extends React.ComponentProps<typeof CommandPrimitive.List> {
    /** Actions to render as CommandItems. Compatible with ActionDefinition[]. */
    actions?: readonly CommandAction[]
    /** Heading for the auto-rendered actions group */
    actionsHeading?: string
}

function CommandList({
    className,
    children,
    actions,
    actionsHeading = "Actions",
    style,
    ...props
}: CommandListProps) {
    const {
        mode,
        status,
        messages,
        sendMessage,
        addToolApprovalResponse,
        agenticActions,
        switchToChat,
        startNewChat,
        conversations,
        loadConversation,
        inputValue,
    } = useCommandMenuContext()
    const { isMobile, layout, keyboardInset } = useMobileUIContext()

    const stableSendMessage = React.useCallback(
        (msg: { text: string }) => sendMessage(msg.text),
        [sendMessage],
    )
    const stableApproval = addToolApprovalResponse ?? noopApproval

    if (mode === "chat") {
        return (
            <div
                data-slot="command-list"
                className={cn(
                    "order-1 min-h-0 flex-1 overflow-hidden px-3 flex flex-col",
                    isMobile && "px-2",
                    className,
                )}
            >
                {messages.length === 0 ? (
                    <ChatEmpty />
                ) : (
                    <ChatMessageList style={{ flex: "1 1 0%", minHeight: 0 }}>
                        <div className="px-3 py-2 space-y-4">
                            <AssistantMessages
                                messages={messages}
                                sendMessage={stableSendMessage}
                                addToolApprovalResponse={stableApproval}
                            />
                        </div>
                        {status === "streaming" && <ChatLoading />}
                    </ChatMessageList>
                )}
            </div>
        )
    }

    const orderedChildren = React.Children.toArray(children)
    const askAIChildren: React.ReactNode[] = []
    const otherChildren: React.ReactNode[] = []

    orderedChildren.forEach((child) => {
        if (
            React.isValidElement(child) &&
            (child.type === CommandEmpty ||
                (child.type as { displayName?: string }).displayName ===
                    "CommandEmpty")
        ) {
            askAIChildren.push(child)
        } else if (
            React.isValidElement(child) &&
            child.type === ShadcnCommandEmpty
        ) {
            // shadcn/ui CommandEmpty — silently ignore but warn in dev
            if (process.env.NODE_ENV !== "production") {
                console.warn(
                    "[CommandMenu] <CommandEmpty> from shadcn/ui is not needed inside <CommandList>. " +
                        "The AI empty state is rendered automatically. You can safely remove it.",
                )
            }
        } else {
            otherChildren.push(child)
        }
    })

    const resolvedActions = actions ?? agenticActions
    const executableActions = resolvedActions?.filter((a) => a.execute)

    const handleActionSelect = (action: CommandAction) => {
        const label = action.label ?? action.name
        startNewChat()
        switchToChat()
        sendMessage(label)
    }

    const showList =
        inputValue.length > 0 || (isMobile && layout === "keyboard-last")
    const listHeight = isMobile
        ? "calc(100% - var(--cmdk-input-row-height, 3.5rem))"
        : "calc(45vh - 2.75rem)"

    const mergedListStyle = {
        overscrollBehavior: "contain",
        paddingBottom:
            keyboardInset > 0
                ? `${keyboardInset + 8}px`
                : isMobile
                  ? "env(safe-area-inset-bottom)"
                  : undefined,
        ...style,
    } as React.CSSProperties

    return (
        <motion.div
            initial={false}
            animate={{ height: showList ? listHeight : 0 }}
            transition={{ type: "spring", duration: 0.25, bounce: 0 }}
            className={cn("order-1 min-h-0 overflow-hidden px-3", isMobile && "px-2")}
        >
            <CommandPrimitive.List
                data-slot="command-list"
                className={cn(
                    "overflow-x-hidden overflow-y-auto overscroll-contain pt-2 h-full",
                    isMobile && "pt-1",
                    className,
                )}
                style={mergedListStyle}
                {...props}
            >
                {otherChildren}
                {conversations.length > 0 && (
                    <CommandGroup heading="Recent Chats">
                        {conversations.slice(0, 5).map((convo) => (
                            <CommandItem
                                key={convo.id}
                                value={`chat-history-${convo.id}`}
                                keywords={[convo.title]}
                                onSelect={() => loadConversation(convo.id)}
                                className={cn(isMobile && "min-h-12 py-3")}
                            >
                                <MessageCircleIcon className="size-4" />
                                <span className="truncate">{convo.title}</span>
                                <span className="ml-auto text-xs text-muted-foreground">
                                    {formatRelativeTime(convo.updatedAt)}
                                </span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
                {executableActions && executableActions.length > 0 && (
                    <CommandGroup heading={actionsHeading}>
                        {executableActions.map((action) => (
                            <CommandItem
                                key={action.name}
                                value={action.label ?? action.name}
                                onSelect={() => handleActionSelect(action)}
                                className={cn(isMobile && "min-h-12 py-3")}
                            >
                                {action.label ?? action.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
                {askAIChildren}
            </CommandPrimitive.List>
        </motion.div>
    )
}

export { CommandMenu, CommandContent, CommandInput, CommandEmpty, CommandList }
export type {
    CommandMenuProps,
    CommandInputProps,
    CommandEmptyProps,
    CommandListProps,
}

CommandEmpty.displayName = "CommandEmpty"
