"use client"

import type { UIMessage } from "ai"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export interface ChatConversation {
    id: string
    title: string
    messages: UIMessage[]
    createdAt: number
    updatedAt: number
}

interface StoredChatHistory {
    version: 1
    conversations: ChatConversation[]
}

export interface UseChatHistoryOptions {
    storageKey?: string
    maxConversations?: number
    messages: UIMessage[]
    setMessages?: (
        messages: UIMessage[] | ((msgs: UIMessage[]) => UIMessage[]),
    ) => void
}

export interface UseChatHistoryReturn {
    conversations: ChatConversation[]
    currentConversationId: string | null
    startNewChat: () => void
    loadConversation: (id: string) => void
    saveCurrentConversation: () => void
}

function generateId(): string {
    return crypto.randomUUID()
}

function deriveTitle(messages: UIMessage[]): string {
    const firstUser = messages.find((m) => m.role === "user")
    if (!firstUser) return "New conversation"
    const text =
        firstUser.parts
            ?.filter(
                (p): p is { type: "text"; text: string } => p.type === "text",
            )
            .map((p) => p.text)
            .join(" ") || "New conversation"
    return text.length > 50 ? text.slice(0, 50) + "..." : text
}

function validateStored(data: unknown): StoredChatHistory | null {
    if (
        typeof data !== "object" ||
        data === null ||
        !("version" in data) ||
        (data as { version: unknown }).version !== 1 ||
        !("conversations" in data) ||
        !Array.isArray((data as { conversations: unknown }).conversations)
    ) {
        return null
    }
    return data as StoredChatHistory
}

export function useChatHistory({
    storageKey = "cmdk-chat-history",
    maxConversations = 50,
    messages,
    setMessages,
}: UseChatHistoryOptions): UseChatHistoryReturn {
    const [conversations, setConversations] = useState<ChatConversation[]>([])
    const [currentConversationId, setCurrentConversationId] = useState<
        string | null
    >(null)
    const [isLoaded, setIsLoaded] = useState(false)

    // Refs to avoid stale closures (matches pattern in command-menu-context.tsx:69-70)
    const messagesRef = useRef(messages)
    messagesRef.current = messages

    const setMessagesRef = useRef(setMessages)
    setMessagesRef.current = setMessages

    const conversationsRef = useRef(conversations)
    conversationsRef.current = conversations

    const currentConversationIdRef = useRef(currentConversationId)
    currentConversationIdRef.current = currentConversationId

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(storageKey)
            if (stored) {
                const json: unknown = JSON.parse(stored)
                const result = validateStored(json)
                if (result) {
                    setConversations(result.conversations)
                } else {
                    console.warn(
                        "Chat history: stored data failed validation. Discarding.",
                    )
                    localStorage.removeItem(storageKey)
                }
            }
        } catch (error) {
            console.error("Failed to load chat history:", error)
        } finally {
            setIsLoaded(true)
        }
    }, [storageKey])

    // Save to localStorage when conversations change (after initial load)
    useEffect(() => {
        if (!isLoaded) return
        try {
            const stored: StoredChatHistory = {
                version: 1,
                conversations,
            }
            localStorage.setItem(storageKey, JSON.stringify(stored))
        } catch (error) {
            console.error("Failed to save chat history:", error)
        }
    }, [conversations, storageKey, isLoaded])

    const saveCurrentConversation = useCallback(() => {
        const msgs = messagesRef.current
        const id = currentConversationIdRef.current
        if (!id || msgs.length === 0) return

        setConversations((prev) => {
            const now = Date.now()
            const existing = prev.find((c) => c.id === id)
            if (existing) {
                return prev.map((c) =>
                    c.id === id
                        ? {
                              ...c,
                              messages: msgs,
                              title: deriveTitle(msgs),
                              updatedAt: now,
                          }
                        : c,
                )
            }
            const newConvo: ChatConversation = {
                id,
                title: deriveTitle(msgs),
                messages: msgs,
                createdAt: now,
                updatedAt: now,
            }
            return [newConvo, ...prev].slice(0, maxConversations)
        })
    }, [maxConversations])

    const startNewChat = useCallback(() => {
        // Save current conversation if it has messages
        if (
            currentConversationIdRef.current &&
            messagesRef.current.length > 0
        ) {
            saveCurrentConversation()
        }

        // Clear messages and start fresh
        setMessagesRef.current?.([])
        setCurrentConversationId(generateId())
    }, [saveCurrentConversation])

    const loadConversation = useCallback(
        (id: string) => {
            // Save current conversation if it has messages
            if (
                currentConversationIdRef.current &&
                messagesRef.current.length > 0
            ) {
                saveCurrentConversation()
            }

            const convo = conversationsRef.current.find((c) => c.id === id)
            if (convo) {
                setMessagesRef.current?.(convo.messages)
                setCurrentConversationId(id)
            }
        },
        [saveCurrentConversation],
    )

    return useMemo(
        () => ({
            conversations,
            currentConversationId,
            startNewChat,
            loadConversation,
            saveCurrentConversation,
        }),
        [
            conversations,
            currentConversationId,
            startNewChat,
            loadConversation,
            saveCurrentConversation,
        ],
    )
}
