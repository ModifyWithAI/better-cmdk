"use client"

import { flatToTree } from "@json-render/react"
import type { UIMessage } from "ai"
import * as React from "react"
import { z } from "zod"
import {
    Confirmation,
    ConfirmationAccepted,
    ConfirmationAction,
    ConfirmationActions,
    ConfirmationRejected,
    ConfirmationRequest,
    ConfirmationTitle,
} from "./confirmation"
import { AssistantFormRenderer } from "./form-renderer"
import { Message, MessageContent, MessageResponse } from "./message"
import { Task, TaskContent, TaskItem, TaskTrigger } from "./task"

const ToolActionSchema = z.object({
    name: z.string(),
    options: z.record(z.string(), z.unknown()).optional(),
})

type ToolAction = z.infer<typeof ToolActionSchema>

const PerformActionsInputSchema = z.object({
    actions: z.array(ToolActionSchema).optional(),
})

const ApprovalSchema = z.object({
    id: z.string(),
    approved: z.boolean().optional(),
})

const RawUIElementSchema = z.object({
    type: z.string(),
    props: z.record(z.string(), z.unknown()).default({}),
    children: z.array(z.string()).optional(),
    parentKey: z.string().nullable().optional(),
})

const RenderUIOutputSchema = z.object({
    ui: z.object({
        elements: z.record(z.string(), RawUIElementSchema),
    }),
    context: z.record(z.string(), z.unknown()).optional(),
})

export interface AssistantMessagesProps {
    messages: UIMessage[]
    sendMessage: (message: { text: string }) => void
    addToolApprovalResponse: (response: {
        id: string
        approved: boolean
    }) => void
    getActionDescription?: (action: ToolAction) => string
}

function defaultGetActionDescription(action: ToolAction): string {
    return action.name
}

export function AssistantMessages({
    messages,
    sendMessage,
    addToolApprovalResponse,
    getActionDescription = defaultGetActionDescription,
}: AssistantMessagesProps) {
    const filteredMessages = messages.filter(
        (m) => m.role === "user" || m.role === "assistant",
    )

    return (
        <>
            {filteredMessages.map((message, messageIndex) => {
                const isLastMessage =
                    messageIndex === filteredMessages.length - 1

                return (
                    <Message
                        from={message.role as "user" | "assistant"}
                        key={message.id}
                    >
                        <MessageContent>
                            {message.parts.map((part, partIndex) => (
                                <MessagePart
                                    key={`${message.id}-${partIndex}`}
                                    part={part}
                                    messageId={message.id}
                                    partIndex={partIndex}
                                    isLastMessage={isLastMessage}
                                    sendMessage={sendMessage}
                                    addToolApprovalResponse={
                                        addToolApprovalResponse
                                    }
                                    getActionDescription={getActionDescription}
                                />
                            ))}
                        </MessageContent>
                    </Message>
                )
            })}
        </>
    )
}

interface MessagePartProps {
    part: UIMessage["parts"][number]
    messageId: string
    partIndex: number
    isLastMessage: boolean
    sendMessage: (message: { text: string }) => void
    addToolApprovalResponse: (response: {
        id: string
        approved: boolean
    }) => void
    getActionDescription: (action: ToolAction) => string
}

function MessagePart({
    part,
    messageId,
    partIndex,
    isLastMessage,
    sendMessage,
    addToolApprovalResponse,
    getActionDescription,
}: MessagePartProps) {
    if (part.type === "text") {
        return <MessageResponse>{part.text}</MessageResponse>
    }

    if (part.type === "tool-performActions") {
        const rawInput = "input" in part ? part.input : undefined
        const inputResult = PerformActionsInputSchema.safeParse(rawInput)
        const actions = inputResult.success
            ? (inputResult.data.actions ?? [])
            : []
        if (actions.length === 0) return null

        const actionCount = actions.length
        const state = "state" in part ? part.state : undefined
        const rawApproval = "approval" in part ? part.approval : undefined
        const approvalResult = ApprovalSchema.safeParse(rawApproval)
        const approval = approvalResult.success
            ? approvalResult.data
            : undefined

        if (approval && state) {
            return (
                <Confirmation state={state} approval={approval}>
                    <ConfirmationTitle>
                        {actionCount === 1
                            ? "Confirm action"
                            : `Confirm ${actionCount} actions`}
                    </ConfirmationTitle>
                    <ConfirmationRequest>
                        <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
                            {actions.map((action, j) => (
                                <li key={`${messageId}-${partIndex}-${j}`}>
                                    {getActionDescription(action)}
                                </li>
                            ))}
                        </ul>
                    </ConfirmationRequest>
                    <ConfirmationAccepted>
                        <span className="text-sm text-muted-foreground">
                            {actionCount === 1
                                ? "Action approved"
                                : `${actionCount} actions approved`}
                        </span>
                    </ConfirmationAccepted>
                    <ConfirmationRejected>
                        <span className="text-sm text-muted-foreground">
                            {actionCount === 1
                                ? "Action cancelled"
                                : `${actionCount} actions cancelled`}
                        </span>
                    </ConfirmationRejected>
                    <ConfirmationActions>
                        <ConfirmationAction
                            variant="outline"
                            onClick={() =>
                                addToolApprovalResponse({
                                    id: approval.id,
                                    approved: false,
                                })
                            }
                        >
                            Deny
                        </ConfirmationAction>
                        <ConfirmationAction
                            onClick={() =>
                                addToolApprovalResponse({
                                    id: approval.id,
                                    approved: true,
                                })
                            }
                        >
                            Approve
                        </ConfirmationAction>
                    </ConfirmationActions>
                </Confirmation>
            )
        }

        const title =
            actionCount === 1
                ? "Performing 1 action"
                : `Performing ${actionCount} actions`

        return (
            <Task defaultOpen={false}>
                <TaskTrigger title={title} />
                <TaskContent>
                    {actions.map((action, j) => (
                        <TaskItem key={`${messageId}-${partIndex}-${j}`}>
                            {getActionDescription(action)}
                        </TaskItem>
                    ))}
                </TaskContent>
            </Task>
        )
    }

    if (part.type === "tool-renderUI" && isLastMessage) {
        const state = "state" in part ? part.state : undefined
        if (state === "output-available" && "output" in part) {
            return (
                <ToolRenderUIForm
                    output={part.output}
                    sendMessage={sendMessage}
                />
            )
        }
        return null
    }

    return null
}

function ToolRenderUIForm({
    output,
    sendMessage,
}: {
    output: unknown
    sendMessage: (message: { text: string }) => void
}) {
    const parsed = React.useMemo(() => {
        const result = RenderUIOutputSchema.safeParse(output)
        if (!result.success) return null
        const elements = Object.entries(result.data.ui.elements).map(
            ([key, el]) => ({ ...el, key }),
        )
        return {
            ui: flatToTree(elements),
            context: result.data.context,
        }
    }, [output])

    const handleSubmit = React.useCallback(
        (formId: string, data: Record<string, string>) => {
            sendMessage({
                text: `[Form:${formId}] ${JSON.stringify(data)}`,
            })
        },
        [sendMessage],
    )

    const handleCancel = React.useCallback(
        (formId: string) => {
            sendMessage({
                text: `[Form:${formId}] cancelled`,
            })
        },
        [sendMessage],
    )

    if (!parsed) return null

    return (
        <AssistantFormRenderer
            ui={parsed.ui}
            context={parsed.context}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
        />
    )
}
