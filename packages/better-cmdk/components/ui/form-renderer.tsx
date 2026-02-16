"use client"

import type { UITree } from "@json-render/core"
import type { ComponentRegistry } from "@json-render/react"
import { JSONUIProvider, Renderer } from "@json-render/react"
import { useCallback, useMemo } from "react"
import { z } from "zod"
import { defaultFormRegistry } from "./form-components"

const SubmitActionSchema = z.object({
    formId: z.string(),
    data: z.record(z.string(), z.string()),
})

const CancelActionSchema = z.object({
    formId: z.string(),
})

export interface AssistantFormRendererProps {
    ui: UITree
    context?: Record<string, unknown>
    onSubmit: (formId: string, data: Record<string, string>) => void
    onCancel?: (formId: string) => void
    registry?: ComponentRegistry
}

export function AssistantFormRenderer({
    ui,
    context,
    onSubmit,
    onCancel,
    registry = defaultFormRegistry,
}: AssistantFormRendererProps) {
    const handleSubmit = useCallback(
        (params: Record<string, unknown>) => {
            const result = SubmitActionSchema.safeParse(params)
            if (result.success) {
                onSubmit(result.data.formId, result.data.data)
            } else {
                console.warn(
                    "Form submit: Invalid params",
                    result.error.flatten(),
                )
            }
        },
        [onSubmit],
    )

    const handleCancel = useCallback(
        (params: Record<string, unknown>) => {
            const result = CancelActionSchema.safeParse(params)
            if (result.success) {
                onCancel?.(result.data.formId)
            } else {
                console.warn(
                    "Form cancel: Invalid params",
                    result.error.flatten(),
                )
            }
        },
        [onCancel],
    )

    const actionHandlers = useMemo(
        () => ({ submit: handleSubmit, cancel: handleCancel }),
        [handleSubmit, handleCancel],
    )

    return (
        <JSONUIProvider
            registry={registry}
            initialData={context}
            actionHandlers={actionHandlers}
        >
            <Renderer tree={ui} registry={registry} />
        </JSONUIProvider>
    )
}

export { defaultFormRegistry } from "./form-components"
