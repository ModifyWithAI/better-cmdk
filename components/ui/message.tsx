"use client"

import type { UIMessage } from "ai"
import type React from "react"
import type { ComponentProps, CSSProperties, HTMLAttributes } from "react"
import { memo } from "react"
import { Streamdown } from "streamdown"
import { cn } from "../../lib/utils"

export type MessageProps = Omit<HTMLAttributes<HTMLDivElement>, "className"> & {
    from: UIMessage["role"]
}

export function Message({ from, ...props }: MessageProps) {
    return (
        <div
            data-slot="message"
            data-from={from}
            className={cn(
                "group flex w-full max-w-[95%] flex-col gap-2",
                from === "user"
                    ? "is-user ml-auto justify-end"
                    : "is-assistant",
            )}
            {...props}
        />
    )
}

export type MessageContentProps = Omit<
    HTMLAttributes<HTMLDivElement>,
    "className"
>

export function MessageContent({ children, style, ...props }: MessageContentProps & { style?: CSSProperties }) {
    return (
        <div
            data-slot="message-content"
            className={cn(
                "flex w-fit min-w-0 max-w-full flex-col gap-2 overflow-hidden text-sm",
                "group-[.is-user]:ml-auto group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground",
                "group-[.is-assistant]:text-foreground",
            )}
            style={{ borderRadius: 'var(--cmdk-radius, 0.5rem)', ...style }}
            {...props}
        >
            {children}
        </div>
    )
}

export type MessageResponseProps = Omit<
    ComponentProps<typeof Streamdown>,
    "className"
>

export const MessageResponse: React.MemoExoticComponent<
    (props: MessageResponseProps) => React.JSX.Element
> = memo(
    function MessageResponse(props: MessageResponseProps): React.JSX.Element {
        return (
            <Streamdown
                data-slot="message-response"
                className="size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                {...props}
            />
        )
    },
    (prevProps, nextProps) => prevProps.children === nextProps.children,
)
