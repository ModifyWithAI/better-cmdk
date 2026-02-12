"use client"

import type { UIMessage } from "ai"
import {
    Command as CommandPrimitive,
    defaultFilter,
    useCommandState,
} from "../../lib/cmdk"
import {
    ArrowUpIcon,
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
    expanded,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
    corners?: CommandMenuCorners
    borderColor?: string
    expanded?: boolean
}) {
    return (
        <DialogPortal data-slot="dialog-portal">
            <div
                className="fixed top-1/3 left-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%]"
                style={{ maxWidth: "45vw" }}
            >
                <DialogPrimitive.Content
                    data-slot="dialog-content"
                    className={cn(
                        "backdrop-blur-xl flex flex-col w-full overflow-hidden border border-input p-0 ring-0 outline-none",
                        cornersMap[corners],
                        className,
                    )}
                    style={
                        {
                            "--cmdk-radius": cornersValueMap[corners],
                            maxHeight: "45vh",
                            backgroundColor: "color-mix(in oklch, var(--background) 95%, transparent)",
                            boxShadow: "4px 4px 12px -2px rgba(0,0,0,0.12), -4px 4px 12px -2px rgba(0,0,0,0.12), 0 8px 16px -4px rgba(0,0,0,0.1)",
                            ...(borderColor
                                ? { "--tw-ring-color": borderColor }
                                : {}),
                        } as React.CSSProperties
                    }
                    {...props}
                >
                    {children}
                </DialogPrimitive.Content>
                <div className="flex justify-end select-none">
                    <a href="https://better-cmdk.com" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground font-medium px-2 py-0.5 hover:text-foreground transition-colors" style={{ borderRadius: "0 0 0.375rem 0.375rem", marginRight: "1rem", backgroundColor: "color-mix(in oklch, var(--background) 95%, transparent)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderLeft: "1px solid var(--color-input)", borderRight: "1px solid var(--color-input)", borderBottom: "1px solid var(--color-input)", boxShadow: "4px 4px 12px -2px rgba(0,0,0,0.12), -4px 4px 12px -2px rgba(0,0,0,0.12), 0 8px 16px -4px rgba(0,0,0,0.1)" }}>
                        powered by better-cmdk
                    </a>
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
    ...props
}: Omit<CommandMenuProps, "chatEndpoint" | "chat" | "onModeChange">) {
    const {
        mode,
        status,
        switchToCommand,
        messages,
        isEnabled,
        sendMessage,
        addToolApprovalResponse,
        setInputValue,
        inputValue,
    } = useCommandMenuContext()

    const expanded = mode === "chat" || inputValue.length > 0

    const handleOpenChange = React.useCallback(
        (open: boolean) => {
            if (open) setInputValue("")
            props.onOpenChange?.(open)
        },
        [props.onOpenChange, setInputValue],
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
        <Dialog {...props} onOpenChange={handleOpenChange}>
            <CommandContent
                className={className}
                corners={corners}
                borderColor={borderColor}
                expanded={expanded}
                onEscapeKeyDown={handleEscapeKeyDown}
            >
                <DialogHeader className="sr-only">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <CommandPrimitive
                    data-slot="command"
                    className={cn(
                        "**:data-[slot=command-input-wrapper]:bg-transparent rounded-none bg-transparent **:data-[slot=command-input]:!h-11 **:data-[slot=command-input]:py-0 **:data-[slot=command-input-wrapper]:mb-0 **:data-[slot=command-input-wrapper]:!h-11",
                        "text-popover-foreground flex h-full min-h-0 w-full flex-col overflow-hidden",
                    )}
                    style={{ borderRadius: "var(--cmdk-radius, 0.75rem)" }}
                >
                    {renderChildren()}
                </CommandPrimitive>
            </CommandContent>
        </Dialog>
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

    const showList = mode === "chat" || inputValue.length > 0

    return (
        <div
            data-slot="command-input-wrapper"
            className={cn(
                "order-2 flex h-11 items-center gap-2 px-6 transition-[margin,border-color] duration-200",
                showList ? "border-t border-input mt-0" : "border-t border-transparent mt-0",
            )}
        >
            <CommandPrimitive.Input
                data-slot="command-input"
                value={inputValue}
                onValueChange={setInputValue}
                onKeyDown={handleKeyDown}
                className={cn(
                    "placeholder:text-muted-foreground flex h-10 w-full bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                {...props}
                placeholder={mode === "chat" ? "Ask AI..." : props.placeholder}
            />
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
                    className,
                )}
                style={{ borderRadius: "var(--cmdk-radius, 0.75rem)" }}
                {...props}
            >
                <MessageCircleIcon className="size-4 shrink-0 text-primary" />
                <div className="flex flex-col items-start gap-0.5">
                    <span className="font-medium">{label}</span>
                </div>
                <span className="ml-auto flex items-center gap-1">
                    <Kbd>⌘</Kbd>
                    <Kbd>↵</Kbd>
                </span>
            </CommandPrimitive.Item>
        </CommandPrimitive.Group>
    )
}

/**
 * Describes a single option/parameter for an action.
 * Compatible with ActionOption from modifywithai.
 */
export interface CommandActionOption {
    type: string
    description?: string
    required?: boolean
}

/**
 * Minimal action interface compatible with ActionDefinition from modifywithai.
 * Only `name` and `execute` are needed — all other ActionDefinition fields are ignored.
 */
export interface CommandAction {
    name: string
    label?: string
    options?: Record<string, CommandActionOption>
    execute?: (options: Record<string, unknown>) => void
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

    const grouped = groupCommands(commands)

    return (
        <>
            <CommandInput placeholder={placeholder} showSendButton />
            <CommandList>
                {grouped.map((group, gi) => {
                    const items = group.items.map((cmd) => {
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
                                keywords={
                                    allKeywords.length > 0
                                        ? allKeywords
                                        : undefined
                                }
                                disabled={cmd.disabled}
                                onSelect={() => cmd.onSelect?.()}
                            >
                                {cmd.icon}
                                {label}
                                {cmd.shortcut && (
                                    <CommandShortcut>
                                        {cmd.shortcut}
                                    </CommandShortcut>
                                )}
                            </CommandItem>
                        )
                    })

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
    actions?: CommandAction[]
    /** Heading for the auto-rendered actions group */
    actionsHeading?: string
}

function CommandList({
    className,
    children,
    actions,
    actionsHeading = "Actions",
    ...props
}: CommandListProps) {
    const {
        mode,
        status,
        messages,
        sendMessage,
        addToolApprovalResponse,
        agenticActions,
        requestClose,
        switchToChat,
        startNewChat,
        conversations,
        loadConversation,
        inputValue,
    } = useCommandMenuContext()

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

    const showList = inputValue.length > 0

    return (
        <motion.div
            initial={false}
            animate={{ height: showList ? "calc(45vh - 2.75rem)" : 0 }}
            transition={{ type: "spring", duration: 0.25, bounce: 0 }}
            className="order-1 min-h-0 overflow-hidden px-3"
        >
            <CommandPrimitive.List
                data-slot="command-list"
                className={cn(
                    "overflow-x-hidden overflow-y-auto overscroll-contain pt-2 h-full",
                    className,
                )}
                style={{ overscrollBehavior: "contain" }}
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
