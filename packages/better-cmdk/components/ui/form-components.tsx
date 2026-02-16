"use client"

import type {
    ComponentRegistry,
    ComponentRenderProps,
} from "@json-render/react"
import type { KeyboardEvent } from "react"
import { cn } from "../../lib/utils"

function stopKeyboardPropagation(e: KeyboardEvent) {
    e.stopPropagation()
}

export function FormRenderer({
    element,
    children,
    onAction,
}: ComponentRenderProps<{ id: string; title?: string; submitLabel?: string }>) {
    const props = element.props ?? {}
    const { id = "form", title, submitLabel = "Submit" } = props

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data: Record<string, string> = {}
        formData.forEach((value, key) => {
            if (typeof value === "string") {
                data[key] = value
            }
        })
        onAction?.({
            name: "submit",
            params: { formId: id, data },
        })
    }

    return (
        <div
            data-slot="form-card"
            className={cn(
                "w-full rounded-lg border bg-card text-card-foreground shadow-sm",
            )}
        >
            {title && (
                <div className="flex flex-col space-y-1.5 p-4 pb-3">
                    <h3 className="text-base font-semibold leading-none tracking-tight">
                        {title}
                    </h3>
                </div>
            )}
            <div className={cn("p-4", title ? "" : "pt-4")}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {children}
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            className={cn(
                                "inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors",
                                "hover:bg-accent hover:text-accent-foreground",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                "disabled:pointer-events-none disabled:opacity-50",
                            )}
                            onClick={() =>
                                onAction?.({
                                    name: "cancel",
                                    params: { formId: id },
                                })
                            }
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={cn(
                                "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors",
                                "hover:bg-primary/90",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                "disabled:pointer-events-none disabled:opacity-50",
                            )}
                        >
                            {submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export function TextFieldRenderer({
    element,
}: ComponentRenderProps<{
    name: string
    label: string
    placeholder?: string
    required?: boolean
    defaultValue?: string
}>) {
    const props = element.props ?? {}
    const {
        name = "field",
        label = "Field",
        placeholder,
        required,
        defaultValue,
    } = props

    return (
        <div className="space-y-1.5">
            <label
                htmlFor={name}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
            </label>
            <input
                id={name}
                name={name}
                type="text"
                placeholder={placeholder}
                required={required}
                defaultValue={defaultValue}
                autoComplete="off"
                onKeyDown={stopKeyboardPropagation}
                onKeyUp={stopKeyboardPropagation}
                className={cn(
                    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
                    "placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                )}
            />
        </div>
    )
}

export function TextAreaRenderer({
    element,
}: ComponentRenderProps<{
    name: string
    label: string
    placeholder?: string
    required?: boolean
    defaultValue?: string
    rows?: number
}>) {
    const props = element.props ?? {}
    const {
        name = "field",
        label = "Field",
        placeholder,
        required,
        defaultValue,
        rows = 3,
    } = props

    return (
        <div className="space-y-1.5">
            <label
                htmlFor={name}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
            </label>
            <textarea
                id={name}
                name={name}
                placeholder={placeholder}
                required={required}
                defaultValue={defaultValue}
                rows={rows}
                onKeyDown={stopKeyboardPropagation}
                onKeyUp={stopKeyboardPropagation}
                className={cn(
                    "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
                    "placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                )}
            />
        </div>
    )
}

export function DateFieldRenderer({
    element,
}: ComponentRenderProps<{
    name: string
    label: string
    required?: boolean
    defaultValue?: string
    min?: string
    max?: string
}>) {
    const props = element.props ?? {}
    const {
        name = "date",
        label = "Date",
        required,
        defaultValue,
        min,
        max,
    } = props

    return (
        <div className="space-y-1.5">
            <label
                htmlFor={name}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
            </label>
            <input
                type="date"
                id={name}
                name={name}
                required={required}
                defaultValue={defaultValue}
                min={min}
                max={max}
                onKeyDown={stopKeyboardPropagation}
                onKeyUp={stopKeyboardPropagation}
                className={cn(
                    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                )}
            />
        </div>
    )
}

export const defaultFormRegistry: ComponentRegistry = {
    Form: FormRenderer,
    TextField: TextFieldRenderer,
    TextArea: TextAreaRenderer,
    DateField: DateFieldRenderer,
}
