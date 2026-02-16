"use client"

import { ChevronDownIcon, SearchIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { cn } from "../../lib/utils"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "./collapsible"

export type TaskItemFileProps = Omit<ComponentProps<"div">, "className">

export function TaskItemFile({ children, ...props }: TaskItemFileProps) {
    return (
        <div
            data-slot="task-item-file"
            className="inline-flex items-center gap-1 rounded-md border bg-secondary px-1.5 py-0.5 text-xs text-foreground"
            {...props}
        >
            {children}
        </div>
    )
}

export type TaskItemProps = Omit<ComponentProps<"div">, "className">

export function TaskItem({ children, ...props }: TaskItemProps) {
    return (
        <div
            data-slot="task-item"
            className="text-sm text-muted-foreground"
            {...props}
        >
            {children}
        </div>
    )
}

export type TaskProps = Omit<ComponentProps<typeof Collapsible>, "className">

export function Task({ defaultOpen = true, ...props }: TaskProps) {
    return <Collapsible data-slot="task" defaultOpen={defaultOpen} {...props} />
}

export type TaskTriggerProps = Omit<
    ComponentProps<typeof CollapsibleTrigger>,
    "className"
> & {
    title: string
    icon?: ReactNode
}

export function TaskTrigger({
    children,
    title,
    icon,
    ...props
}: TaskTriggerProps) {
    return (
        <CollapsibleTrigger asChild className="group" {...props}>
            {children ?? (
                <div className="flex w-full cursor-pointer items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {icon ?? <SearchIcon className="size-4" />}
                    <p className="text-sm">{title}</p>
                    <ChevronDownIcon className="size-4 transition-transform group-data-[state=open]:rotate-180" />
                </div>
            )}
        </CollapsibleTrigger>
    )
}

export type TaskContentProps = Omit<
    ComponentProps<typeof CollapsibleContent>,
    "className"
>

export function TaskContent({ children, ...props }: TaskContentProps) {
    return (
        <CollapsibleContent
            data-slot="task-content"
            className={cn(
                "text-popover-foreground outline-none",
                "data-[state=closed]:animate-out data-[state=open]:animate-in",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2",
            )}
            {...props}
        >
            <div className="mt-4 space-y-2 border-l-2 border-muted pl-4">
                {children}
            </div>
        </CollapsibleContent>
    )
}
