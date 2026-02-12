"use client"

import { Command as CommandPrimitive } from "../../lib/cmdk"
import { SearchIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import * as React from "react"

import { cn } from "../../lib/utils"
import {
    Dialog,
    DialogDescription,
    DialogHeader,
    DialogPortal,
    DialogTitle,
} from "./dialog"
import { Kbd } from "./kbd"

function Command({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
    return (
        <CommandPrimitive
            data-slot="command"
            className={cn(
                "text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
                className,
            )}
            {...props}
        />
    )
}

function CommandDialogContent({
    className,
    children,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
    return (
        <DialogPortal data-slot="dialog-portal">
            <DialogPrimitive.Content
                data-slot="dialog-content"
                className={cn(
                    "backdrop-blur-xl fixed top-1/3 left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-xl border-none p-2 shadow-2xl ring-0 duration-200 outline-none sm:max-w-lg",
                    className,
                )}
                style={{ backgroundColor: "color-mix(in oklch, var(--background) 95%, transparent)" }}
                {...props}
            >
                {children}
            </DialogPrimitive.Content>
        </DialogPortal>
    )
}

function CommandDialog({
    title = "Command Palette",
    description = "Search for a command to run...",
    children,
    className,
    ...props
}: React.ComponentProps<typeof Dialog> & {
    title?: string
    description?: string
    className?: string
}) {
    return (
        <Dialog {...props}>
            <CommandDialogContent className={className}>
                <DialogHeader className="sr-only">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <Command className="**:data-[slot=command-input-wrapper]:bg-transparent **:data-[slot=command-input-wrapper]:border-input rounded-none bg-transparent **:data-[slot=command-input]:!h-9 **:data-[slot=command-input]:py-0 **:data-[slot=command-input-wrapper]:mb-0 **:data-[slot=command-input-wrapper]:!h-9 **:data-[slot=command-input-wrapper]:rounded-md **:data-[slot=command-input-wrapper]:border">
                    {children}
                </Command>
            </CommandDialogContent>
        </Dialog>
    )
}

function CommandInput({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
    return (
        <div
            data-slot="command-input-wrapper"
            className="order-2 flex h-9 items-center gap-2 border-t px-3"
        >
            <SearchIcon className="size-4 shrink-0 opacity-50" />
            <CommandPrimitive.Input
                data-slot="command-input"
                className={cn(
                    "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                {...props}
            />
        </div>
    )
}

function CommandList({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
    return (
        <CommandPrimitive.List
            data-slot="command-list"
            className={cn(
                "order-1 max-h-[300px] min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain",
                className,
            )}
            style={{ overscrollBehavior: "contain" }}
            {...props}
        />
    )
}

function CommandEmpty({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
    return (
        <CommandPrimitive.Empty
            data-slot="command-empty"
            className={cn(
                "text-muted-foreground py-6 text-center text-sm",
                className,
            )}
            {...props}
        />
    )
}

function CommandGroup({
    className,
    ref,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
    const groupRef = React.useCallback(
        (node: HTMLDivElement | null) => {
            if (node) {
                const heading = node.querySelector("[cmdk-group-heading]")
                if (heading instanceof HTMLElement) {
                    heading.style.position = "sticky"
                    heading.style.top = "0"
                    heading.style.zIndex = "10"
                    heading.style.width = "fit-content"
                    heading.style.backdropFilter = "blur(24px)"
                    heading.style.WebkitBackdropFilter = "blur(24px)"
                    heading.style.backgroundColor = "color-mix(in oklch, var(--background) 95%, transparent)"
                    heading.style.borderRadius = "6px"
                    heading.style.setProperty("padding-top", "4px", "important")
                    heading.style.setProperty("padding-bottom", "4px", "important")
                }
            }
            if (typeof ref === "function") ref(node)
            else if (ref) ref.current = node
        },
        [ref],
    )

    return (
        <CommandPrimitive.Group
            ref={groupRef}
            data-slot="command-group"
            className={cn(
                "text-foreground !p-0 [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:scroll-mt-16 [&_[cmdk-group-heading]]:pt-0! [&_[cmdk-group-heading]]:!p-3 [&_[cmdk-group-heading]]:!pb-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
                className,
            )}
            {...props}
        />
    )
}

function CommandSeparator({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
    return (
        <CommandPrimitive.Separator
            data-slot="command-separator"
            className={cn("bg-border -mx-1 h-px", className)}
            {...props}
        />
    )
}

function CommandItem({
    className,
    style,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
    return (
        <CommandPrimitive.Item
            data-slot="command-item"
            className={cn(
                "data-[selected=true]:border-input data-[selected=true]:bg-input/50 [&_svg:not([class*='text-'])]:text-muted-foreground relative flex h-9 cursor-default items-center gap-2 border border-transparent px-3 text-sm font-medium outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            style={{ borderRadius: "var(--cmdk-radius, 0.375rem)", ...style }}
            {...props}
        />
    )
}

function CommandShortcut({
    className,
    children,
    ...props
}: React.ComponentProps<"span">) {
    const keys = typeof children === "string" ? [...children] : null

    return (
        <span
            data-slot="command-shortcut"
            className={cn("ml-auto flex items-center gap-1", className)}
            {...props}
        >
            {keys ? keys.map((key, i) => <Kbd key={i}>{key}</Kbd>) : children}
        </span>
    )
}

export {
    Command,
    CommandDialog,
    CommandDialogContent,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandShortcut,
    CommandSeparator,
}
