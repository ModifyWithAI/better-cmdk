"use client"

import * as React from "react"
import { captureException } from "../../lib/telemetry"

interface TelemetryErrorBoundaryProps {
    children: React.ReactNode
}

interface TelemetryErrorBoundaryState {
    hasError: boolean
}

export class TelemetryErrorBoundary extends React.Component<
    TelemetryErrorBoundaryProps,
    TelemetryErrorBoundaryState
> {
    constructor(props: TelemetryErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(): TelemetryErrorBoundaryState {
        return { hasError: true }
    }

    override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        captureException(error, {
            componentStack: errorInfo.componentStack ?? undefined,
        })
    }

    override render(): React.ReactNode {
        if (this.state.hasError) {
            return null
        }
        return this.props.children
    }
}
