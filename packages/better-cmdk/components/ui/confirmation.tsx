"use client"

import type { ToolUIPart } from "ai"
import {
    type ComponentProps,
    type CSSProperties,
    createContext,
    type ReactNode,
    useContext,
} from "react"
import { cn } from "../../lib/utils"

export type ToolUIPartApproval =
    | {
          id: string
          approved?: never
          reason?: never
      }
    | {
          id: string
          approved: boolean
          reason?: string
      }
    | undefined

type ConfirmationContextValue = {
    approval: ToolUIPartApproval
    state: ToolUIPart["state"]
}

const ConfirmationContext = createContext<ConfirmationContextValue | null>(null)

function useConfirmation() {
    const context = useContext(ConfirmationContext)
    if (!context) {
        throw new Error(
            "Confirmation components must be used within Confirmation",
        )
    }
    return context
}

export type ConfirmationProps = Omit<ComponentProps<"div">, "className"> & {
    approval?: ToolUIPartApproval
    state: ToolUIPart["state"]
}

export function Confirmation({
    approval,
    state,
    style,
    ...props
}: ConfirmationProps & { style?: CSSProperties }) {
    if (
        !approval ||
        state === "input-streaming" ||
        state === "input-available"
    ) {
        return null
    }

    return (
        <ConfirmationContext.Provider value={{ approval, state }}>
            <div
                data-slot="confirmation"
                data-state={state}
                data-approved={approval?.approved}
                role="alertdialog"
                aria-labelledby="confirmation-title"
                style={{ borderRadius: "var(--cmdk-radius, 0.5rem)", ...style }}
                className={cn(
                    "flex flex-col gap-2 border p-4",
                    "data-[state=approval-requested]:border-amber-500/50 data-[state=approval-requested]:bg-amber-50/50 dark:data-[state=approval-requested]:bg-amber-950/20",
                    "data-[approved=true]:border-green-500/50 data-[approved=true]:bg-green-50/50 dark:data-[approved=true]:bg-green-950/20",
                    "data-[approved=false]:border-red-500/50 data-[approved=false]:bg-red-50/50 dark:data-[approved=false]:bg-red-950/20",
                )}
                {...props}
            />
        </ConfirmationContext.Provider>
    )
}

export type ConfirmationTitleProps = Omit<ComponentProps<"p">, "className">

export function ConfirmationTitle(props: ConfirmationTitleProps) {
    return (
        <p
            id="confirmation-title"
            data-slot="confirmation-title"
            className="text-sm font-medium"
            {...props}
        />
    )
}

export type ConfirmationRequestProps = {
    children?: ReactNode
}

export function ConfirmationRequest({ children }: ConfirmationRequestProps) {
    const { state } = useConfirmation()
    if (state !== "approval-requested") {
        return null
    }
    return <div data-slot="confirmation-request">{children}</div>
}

export type ConfirmationAcceptedProps = {
    children?: ReactNode
}

export function ConfirmationAccepted({ children }: ConfirmationAcceptedProps) {
    const { approval, state } = useConfirmation()
    if (
        !approval?.approved ||
        (state !== "approval-responded" &&
            state !== "output-denied" &&
            state !== "output-available")
    ) {
        return null
    }
    return <div data-slot="confirmation-accepted">{children}</div>
}

export type ConfirmationRejectedProps = {
    children?: ReactNode
}

export function ConfirmationRejected({ children }: ConfirmationRejectedProps) {
    const { approval, state } = useConfirmation()
    if (
        approval?.approved !== false ||
        (state !== "approval-responded" &&
            state !== "output-denied" &&
            state !== "output-available")
    ) {
        return null
    }
    return <div data-slot="confirmation-rejected">{children}</div>
}

export type ConfirmationActionsProps = Omit<ComponentProps<"div">, "className">

export function ConfirmationActions(props: ConfirmationActionsProps) {
    const { state } = useConfirmation()
    if (state !== "approval-requested") {
        return null
    }
    return (
        <div
            data-slot="confirmation-actions"
            className="flex items-center justify-end gap-2 self-end"
            {...props}
        />
    )
}

export type ConfirmationActionProps = Omit<
    ComponentProps<"button">,
    "className"
> & {
    variant?: "default" | "outline" | "destructive"
}

export function ConfirmationAction({
    variant = "default",
    style,
    ...props
}: ConfirmationActionProps & { style?: CSSProperties }) {
    return (
        <button
            data-slot="confirmation-action"
            data-variant={variant}
            type="button"
            className={cn(
                "inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap px-3 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                variant === "default" &&
                    "bg-primary text-primary-foreground shadow hover:bg-primary/90",
                variant === "outline" &&
                    "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
                variant === "destructive" &&
                    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
            )}
            style={{ borderRadius: "var(--cmdk-radius, 0.375rem)", ...style }}
            {...props}
        />
    )
}
