import type { ErrorEvent, EventHint } from "@sentry/browser"
import {
    BrowserClient,
    dedupeIntegration,
    defaultStackParser,
    linkedErrorsIntegration,
    makeFetchTransport,
    Scope,
} from "@sentry/browser"

let _client: BrowserClient | null = null
let _scope: Scope | null = null

const DSN =
    "https://7d9fc7e14e8769805297d46569e33c05@o4510706172755968.ingest.us.sentry.io/4510846832017408"

function isTelemetryDisabled(): boolean {
    try {
        return (
            typeof process !== "undefined" &&
            process.env?.BETTER_CMDK_TELEMETRY_DISABLED === "1"
        )
    } catch {
        return false
    }
}

function stripPii(event: ErrorEvent, _hint: EventHint): ErrorEvent | null {
    delete event.user
    delete event.server_name

    if (event.request) {
        delete event.request.cookies
        delete event.request.headers
        delete event.request.env
        delete event.request.data
    }

    event.breadcrumbs = []

    return event
}

export function initTelemetry(): void {
    if (typeof window === "undefined") return
    if (_client !== null) return
    if (isTelemetryDisabled()) return

    _client = new BrowserClient({
        dsn: DSN,
        transport: makeFetchTransport,
        stackParser: defaultStackParser,
        integrations: [dedupeIntegration(), linkedErrorsIntegration()],
        beforeSend: stripPii,
        sendDefaultPii: false,
        tracesSampleRate: 1.0,
    })

    _scope = new Scope()
    _scope.setClient(_client)
    _client.init()
}

export function isTelemetryEnabled(): boolean {
    return _client !== null
}

export function captureException(
    error: unknown,
    context?: Record<string, unknown>,
): void {
    if (!_scope || !_client) return

    if (context) {
        _scope.captureException(error, {
            captureContext: (s) => {
                s.setExtras(context)
                return s
            },
        })
    } else {
        _scope.captureException(error)
    }
}

function generateHexId(length: number): string {
    try {
        const bytes = new Uint8Array(length / 2)
        crypto.getRandomValues(bytes)
        return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
            "",
        )
    } catch {
        let result = ""
        for (let i = 0; i < length; i++) {
            result += Math.floor(Math.random() * 16).toString(16)
        }
        return result
    }
}

export function startSpan<T>(name: string, op: string, fn: () => T): T {
    if (!_scope || !_client) return fn()

    const startTimestamp = Date.now() / 1000
    const traceId = generateHexId(32)
    const spanId = generateHexId(16)

    let status: "ok" | "internal_error" = "ok"

    const sendTransaction = () => {
        const timestamp = Date.now() / 1000
        _scope!.captureEvent({
            type: "transaction",
            transaction: name,
            start_timestamp: startTimestamp,
            timestamp,
            contexts: {
                trace: {
                    trace_id: traceId,
                    span_id: spanId,
                    op,
                    status,
                },
            },
        })
    }

    try {
        const result = fn()

        if (result instanceof Promise) {
            return result.then(
                (value) => {
                    sendTransaction()
                    return value
                },
                (err) => {
                    status = "internal_error"
                    sendTransaction()
                    throw err
                },
            ) as T // TypeScript can't narrow generic T through instanceof Promise
        }

        sendTransaction()
        return result
    } catch (err) {
        status = "internal_error"
        sendTransaction()
        throw err
    }
}
