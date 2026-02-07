"use client"

import * as React from "react"
import { LoaderIcon } from "lucide-react"
import type { UIMessage } from "ai"
import { cn } from "../../lib/utils"

interface ChatMessageProps extends React.ComponentProps<"div"> {
  message: UIMessage
}

function ChatMessage({
  message,
  className,
  ...props
}: ChatMessageProps) {
  const isUser = message.role === "user"

  // Get text content from UIMessage parts
  const content = message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map(p => p.text)
    .join("")

  return (
    <div
      data-slot="chat-message"
      data-role={message.role}
      className={cn(
        "flex px-3 py-1.5",
        isUser && "justify-end",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "inline-block max-w-[85%] px-3 py-2 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
        style={{ borderRadius: 'var(--cmdk-radius, 0.5rem)' }}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  )
}

interface ChatMessageListProps extends React.ComponentProps<"div"> {
  children: React.ReactNode
}

function ChatMessageList({
  children,
  className,
  ...props
}: ChatMessageListProps) {
  const listRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [children])

  return (
    <div
      ref={listRef}
      data-slot="chat-message-list"
      className={cn(
        "flex flex-col overflow-y-auto scroll-smooth",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface ChatLoadingProps extends React.ComponentProps<"div"> {
  text?: string
}

function ChatLoading({
  text = "AI is thinking...",
  className,
  ...props
}: ChatLoadingProps) {
  return (
    <div
      data-slot="chat-loading"
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground",
        className
      )}
      {...props}
    >
      <LoaderIcon className="size-4 animate-spin" />
      <span>{text}</span>
    </div>
  )
}

interface ChatEmptyProps extends React.ComponentProps<"div"> {
  title?: string
  description?: string
}

function ChatEmpty({
  title = "Start a conversation",
  description = "Ask a question or describe what you need help with.",
  className,
  ...props
}: ChatEmptyProps) {
  return (
    <div
      data-slot="chat-empty"
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-8 text-center",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export { ChatMessage, ChatMessageList, ChatLoading, ChatEmpty }
export type { ChatMessageProps, ChatMessageListProps, ChatLoadingProps, ChatEmptyProps }
