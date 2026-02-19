export type Framework = "nextjs" | "remix" | "tanstack-start" | "vite"

const FRAMEWORK_CONFIG: Record<
	Framework,
	{
		name: string
		component: string
		builtInChatRoute: string
		mwaiAgentsPath: string
		mwaiNote: string
		mountLocation: string
		envFile: string
	}
> = {
	nextjs: {
		name: "Next.js (App Router)",
		component: `\`\`\`tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CommandMenu, type CommandAction } from "better-cmdk"
import { LayoutDashboardIcon, SettingsIcon, SunMoonIcon } from "lucide-react"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // REPLACE with discovered actions from my codebase
  const actions: CommandAction[] = [
    {
      name: "go-dashboard",
      label: "Go to Dashboard",
      description: "Navigate to the dashboard page",
      group: "Navigation",
      icon: <LayoutDashboardIcon className="size-4" />,
      shortcut: "⌘D",
      execute: () => router.push("/dashboard"),
    },
    {
      name: "open-settings",
      label: "Open Settings",
      description: "Navigate to the settings page",
      group: "Navigation",
      icon: <SettingsIcon className="size-4" />,
      shortcut: "⌘,",
      execute: () => router.push("/settings"),
    },
    {
      name: "toggle-dark-mode",
      label: "Toggle dark mode",
      description: "Toggle the application theme",
      group: "Appearance",
      icon: <SunMoonIcon className="size-4" />,
      execute: () => document.documentElement.classList.toggle("dark"),
    },
    {
      name: "go-home",
      label: "Go Home",
      description: "Navigate to the home page",
      group: "Navigation",
      execute: () => router.push("/"),
    },
  ]

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandMenu
      open={open}
      onOpenChange={setOpen}
      actions={actions}
    />
  )
}
\`\`\``,
		builtInChatRoute: `\`\`\`ts
// app/api/chat/route.ts
import { openai } from "@ai-sdk/openai"
import { streamText, convertToModelMessages } from "ai"
import type { UIMessage } from "ai"

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()
  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: await convertToModelMessages(messages),
    system: "You are a helpful assistant in an action palette. Keep responses concise.",
  })
  return result.toUIMessageStreamResponse()
}
\`\`\``,
		mwaiAgentsPath: "node_modules/modifywithai/dist/nextjs/AGENTS.md",
		mwaiNote: "",
		mountLocation:
			"Add `<CommandPalette />` to `app/layout.tsx` inside the `<body>` tag.",
		envFile: ".env.local",
	},

	remix: {
		name: "Remix / React Router v7",
		component: `\`\`\`tsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { CommandMenu, type CommandAction } from "better-cmdk"
import { LayoutDashboardIcon, SettingsIcon, SunMoonIcon } from "lucide-react"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const actions: CommandAction[] = [
    {
      name: "go-dashboard",
      label: "Go to Dashboard",
      description: "Navigate to the dashboard page",
      group: "Navigation",
      icon: <LayoutDashboardIcon className="size-4" />,
      shortcut: "⌘D",
      execute: () => navigate("/dashboard"),
    },
    {
      name: "open-settings",
      label: "Open Settings",
      description: "Navigate to the settings page",
      group: "Navigation",
      icon: <SettingsIcon className="size-4" />,
      shortcut: "⌘,",
      execute: () => navigate("/settings"),
    },
    {
      name: "toggle-dark-mode",
      label: "Toggle dark mode",
      description: "Toggle the application theme",
      group: "Appearance",
      icon: <SunMoonIcon className="size-4" />,
      execute: () => document.documentElement.classList.toggle("dark"),
    },
    {
      name: "go-home",
      label: "Go Home",
      description: "Navigate to the home page",
      group: "Navigation",
      execute: () => navigate("/"),
    },
  ]

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandMenu
      open={open}
      onOpenChange={setOpen}
      actions={actions}
    />
  )
}
\`\`\``,
		builtInChatRoute: `\`\`\`ts
// app/routes/api.chat.ts
import { openai } from "@ai-sdk/openai"
import { streamText, convertToModelMessages } from "ai"
import type { UIMessage } from "ai"
import type { ActionFunctionArgs } from "react-router"

export async function action({ request }: ActionFunctionArgs) {
  const { messages }: { messages: UIMessage[] } = await request.json()
  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: await convertToModelMessages(messages),
    system: "You are a helpful assistant in an action palette. Keep responses concise.",
  })
  return result.toUIMessageStreamResponse()
}
\`\`\``,
		mwaiAgentsPath: "node_modules/modifywithai/dist/remix/AGENTS.md",
		mwaiNote: "",
		mountLocation:
			"Add `<CommandPalette />` to `app/root.tsx` inside the root component.",
		envFile: ".env",
	},

	"tanstack-start": {
		name: "TanStack Start",
		component: `\`\`\`tsx
import { useState, useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import { CommandMenu, type CommandAction } from "better-cmdk"
import { LayoutDashboardIcon, SettingsIcon, SunMoonIcon } from "lucide-react"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const actions: CommandAction[] = [
    {
      name: "go-dashboard",
      label: "Go to Dashboard",
      description: "Navigate to the dashboard page",
      group: "Navigation",
      icon: <LayoutDashboardIcon className="size-4" />,
      shortcut: "⌘D",
      execute: () => navigate({ to: "/dashboard" }),
    },
    {
      name: "open-settings",
      label: "Open Settings",
      description: "Navigate to the settings page",
      group: "Navigation",
      icon: <SettingsIcon className="size-4" />,
      shortcut: "⌘,",
      execute: () => navigate({ to: "/settings" }),
    },
    {
      name: "toggle-dark-mode",
      label: "Toggle dark mode",
      description: "Toggle the application theme",
      group: "Appearance",
      icon: <SunMoonIcon className="size-4" />,
      execute: () => document.documentElement.classList.toggle("dark"),
    },
    {
      name: "go-home",
      label: "Go Home",
      description: "Navigate to the home page",
      group: "Navigation",
      execute: () => navigate({ to: "/" }),
    },
  ]

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandMenu
      open={open}
      onOpenChange={setOpen}
      actions={actions}
    />
  )
}
\`\`\``,
		builtInChatRoute: `\`\`\`ts
// app/routes/api/chat.ts
import { createAPIFileRoute } from "@tanstack/react-start/api"
import { openai } from "@ai-sdk/openai"
import { streamText, convertToModelMessages } from "ai"
import type { UIMessage } from "ai"

export const APIRoute = createAPIFileRoute("/api/chat")({
  POST: async ({ request }) => {
    const { messages }: { messages: UIMessage[] } = await request.json()
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: await convertToModelMessages(messages),
      system: "You are a helpful assistant in an action palette. Keep responses concise.",
    })
    return result.toUIMessageStreamResponse()
  },
})
\`\`\``,
		mwaiAgentsPath:
			"node_modules/modifywithai/dist/tanstack-start/AGENTS.md",
		mwaiNote: "",
		mountLocation:
			"Add `<CommandPalette />` to `app/routes/__root.tsx` inside the root component.",
		envFile: ".env",
	},

	vite: {
		name: "Vite / Other",
		component: `\`\`\`tsx
import { useState, useEffect } from "react"
import { CommandMenu, type CommandAction } from "better-cmdk"
import { LayoutDashboardIcon, SettingsIcon, SunMoonIcon } from "lucide-react"

const actions: CommandAction[] = [
  {
    name: "go-dashboard",
    label: "Go to Dashboard",
    description: "Navigate to the dashboard page",
    group: "Navigation",
    icon: <LayoutDashboardIcon className="size-4" />,
    shortcut: "⌘D",
    execute: () => (window.location.href = "/dashboard"),
  },
  {
    name: "open-settings",
    label: "Open Settings",
    description: "Navigate to the settings page",
    group: "Navigation",
    icon: <SettingsIcon className="size-4" />,
    shortcut: "⌘,",
    execute: () => (window.location.href = "/settings"),
  },
  {
    name: "toggle-dark-mode",
    label: "Toggle dark mode",
    description: "Toggle the application theme",
    group: "Appearance",
    icon: <SunMoonIcon className="size-4" />,
    execute: () => document.documentElement.classList.toggle("dark"),
  },
  {
    name: "go-home",
    label: "Go Home",
    description: "Navigate to the home page",
    group: "Navigation",
    execute: () => {
      window.location.href = "/"
    },
  },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandMenu
      open={open}
      onOpenChange={setOpen}
      actions={actions}
    />
  )
}
\`\`\``,
		builtInChatRoute: `Create a streaming chat endpoint for your framework/server. The handler should:

\`\`\`ts
import { openai } from "@ai-sdk/openai"
import { streamText, convertToModelMessages } from "ai"
import type { UIMessage } from "ai"

// In your POST handler:
const { messages }: { messages: UIMessage[] } = await req.json()
const result = streamText({
  model: openai("gpt-4o-mini"),
  messages: await convertToModelMessages(messages),
  system: "You are a helpful assistant in an action palette. Keep responses concise.",
})
return result.toUIMessageStreamResponse()
\`\`\``,
		mwaiAgentsPath: "node_modules/modifywithai/AGENTS.md",
		mwaiNote: `\n> **Note**: ModifyWithAI requires a server-side token endpoint. If your Vite app uses a separate backend (Express, Fastify, etc.), adapt the token endpoint from the guide that most closely matches your setup. If your app is a pure SPA with no server, choose the built-in chat option instead.\n`,
		mountLocation:
			"Add `<CommandPalette />` to `src/App.tsx` or the main entry component.",
		envFile: ".env",
	},
}

export const INTEGRATION_PROMPT = (framework: Framework): string => {
	const config = FRAMEWORK_CONFIG[framework]

	return `# Set up better-cmdk action palette (${config.name})

better-cmdk is a command palette with AI chat for React. Your task is to install it, discover actions from my codebase, and create a working palette.

## Step 1: Analyze my codebase

Before making changes, detect:
- Tailwind version: v4 (\`@import "tailwindcss"\` in CSS) vs v3 (\`tailwind.config.js/ts\`)
- Existing shadcn/ui: check for \`@/components/ui/command\` or similar shadcn command components
- Package manager: \`bun.lock\` or \`bun.lockb\` → bun, \`pnpm-lock.yaml\` → pnpm, \`yarn.lock\` → yarn, \`package-lock.json\` → npm

Also ask me:

**1. Do you want AI chat in the palette?**
- No AI — action search only
- Built-in chat — free developer-trial Q&A via https://better-cmdk.com/api/chat (no signup, 10 requests per 10 minutes; use your own chat URL for production)
- ModifyWithAI (Recommended) — the AI can execute actions in your app (create items, navigate, toggle settings), ask for approval before destructive operations, and understand what's on screen. Get your App ID and API key from https://modifywithai.com/dashboard

**2. If shadcn/ui command components are detected:** Do you want to migrate them to better-cmdk, or keep both?

Tell me what you detected, which path you'll follow, and what you'll be adding better-cmdk to.

Docs: https://github.com/ModifyWithAI/better-cmdk/blob/main/INTEGRATION.md

---

## Step 2: Install

**Use the package manager already installed** — check for lockfiles.
Do not switch package managers.

### No AI:
\`\`\`bash
# bun
bun add better-cmdk
# pnpm
pnpm add better-cmdk
# npm
npm install better-cmdk
# yarn
yarn add better-cmdk
\`\`\`

### Built-in chat:
\`\`\`bash
# bun
bun add better-cmdk
# pnpm
pnpm add better-cmdk
# npm
npm install better-cmdk
# yarn
yarn add better-cmdk
\`\`\`

If you later add a custom/self-hosted endpoint, install AI SDK/provider packages for that server route.

### ModifyWithAI:
\`\`\`bash
# bun
bun add better-cmdk modifywithai @ai-sdk/react ai
# pnpm
pnpm add better-cmdk modifywithai @ai-sdk/react ai
# npm
npm install better-cmdk modifywithai @ai-sdk/react ai
# yarn
yarn add better-cmdk modifywithai @ai-sdk/react ai
\`\`\`

---

## Step 3: CSS Setup

better-cmdk ships precompiled styles with namespaced tokens.

### Tailwind v4

Add to my main CSS file:

\`\`\`css
@import "tailwindcss";
@import "better-cmdk";
\`\`\`

If my app needs custom theming, override better-cmdk's namespaced variables:

\`\`\`css
.bcmdk-root {
  --bcmdk-radius: 0.625rem;
  --bcmdk-background: 1 0 0;
  --bcmdk-foreground: 0.145 0 0;
  --bcmdk-primary: 0.205 0 0;
  --bcmdk-primary-foreground: 0.985 0 0;
  --bcmdk-muted: 0.97 0 0;
  --bcmdk-muted-foreground: 0.556 0 0;
  --bcmdk-border: 0.922 0 0;
  --bcmdk-input: 0.922 0 0;
  --bcmdk-ring: 0.708 0 0;
}
\`\`\`

### Tailwind v3

Use the same CSS import approach:

\`\`\`css
@import "better-cmdk";
\`\`\`

---

## Step 4: CRITICAL — Command Action Discovery (better-cmdk scope)

Before writing component code, **crawl my codebase** to discover all meaningful actions that can run immediately from the command palette.

### Scope rules (required)

- better-cmdk is concerned with **no-argument command actions** (no \`inputSchema\`, no required arguments)
- Define actions as underlying app/domain operations (API calls, mutations, workflow transitions), not raw UI gestures
- Model what the app does, not how a user physically triggers it
- Good: \`goToBilling\`, \`toggleSidebar\`, \`archiveCurrentProject\`
- Bad: \`clickCreateButton\`, \`openDropdown\`, \`typeIntoInput\`, \`focusSearchField\`
- If an operation needs runtime arguments (for example refund amount, assignee, date range), treat it as **modifywithai-owned** and do not add it as a new better-cmdk command action in this step
- If a standard shared \`actions\` array already exists, **extend it in place**; do not create a second array
- If no standard shared array exists, create one

### Discovery checklist

1. Locate existing action arrays/types first (\`actions\`, \`defineActions(...)\`, exported action modules) and reuse them
2. Search routes/pages → navigation command actions
3. Search buttons/links/forms/menus → identify outcomes that can run with no extra user input
4. Trace handlers to services/API/domain functions → map each to one operation-level command action
5. Search toggles/settings/feature flags → preference command actions
6. Search CRUD/services/utilities/API calls → include only operations that can run safely without additional arguments
7. Search existing keyboard shortcuts → keep as shortcut hints
8. Mark argument-requiring operations for modifywithai ownership (same shared array, with \`inputSchema\`)

### Canonical single-array rules

Use **one deduped \`actions\` array** as the source of truth:

- better-cmdk-owned entries: no \`inputSchema\` (direct command execution)
- modifywithai-owned entries (if present): has \`inputSchema\` (agentic argument collection)
- Keep exactly one canonical action per underlying operation
- Do not create separate “command” and “AI action” entries for the same operation
- Put synonyms in \`keywords\`, not duplicate actions
- Reuse the same \`name\` everywhere (CommandMenu + assistant provider)

Use consistent \`group\` values:
- \`Navigation\`
- \`UI / Preferences\`
- \`Data\`
- \`Help / Utilities\`

### For each command action discovered, define

- \`name\`: unique kebab-case identifier
- \`label\`: human-readable label
- \`group\`: taxonomy group from above
- \`icon\`: lucide-react icon when useful
- \`shortcut\`: optional display hint
- \`keywords\`: optional search aliases
- \`semanticKey\`: optional operation identity (required when names differ but operation is the same)
- \`disabled\`: optional availability guard
- \`execute\`: required implementation used when the command is selected
- \`onSelect\`: optional UI-only override (modifywithai ignores it)

\`inputSchema\` is optional and reserved for modifywithai-owned argument actions in the same shared array.
Unused fields are safe: each library should ignore values it doesn't need.

**Coverage first, count second.** Many non-trivial apps should land in the 10-30+ no-argument command-action range. If you have fewer than 8, you likely missed meaningful command flows.

---

## Step 5: Create the component

Use one shared \`actions\` array (from Step 4). If one already exists, extend it. Do not create a second array.
Replace examples with discovered actions.

${config.component}

---

## Step 6: Add AI chat (skip if “No AI” chosen)

### Built-in chat

Use the default hosted endpoint: \`https://better-cmdk.com/api/chat\`.
This service is provided by better-cmdk as a free developer trial with no signup.
Rate limit: **10 requests per 10 minutes**.

Use CommandMenu without \`chatEndpoint\`:

\`\`\`tsx
<CommandMenu
  open={open}
  onOpenChange={setOpen}
  actions={actions}
/>
\`\`\`

### Optional: custom/self-hosted endpoint

For production, use your own chat URL (or choose ModifyWithAI for agentic capabilities).
If you need your own model/provider route, create a streaming chat API route:

${config.builtInChatRoute}

Then update CommandMenu:

\`\`\`tsx
<CommandMenu
  open={open}
  onOpenChange={setOpen}
  actions={actions}
  chatEndpoint="/api/chat"
/>
\`\`\`

Set environment variable:

\`\`\`bash
echo "OPENAI_API_KEY=sk-..." >> ${config.envFile}
\`\`\`

(Substitute the correct variable name for the AI provider.)

---

### ModifyWithAI

After installing modifywithai, read \`${config.mwaiAgentsPath}\` and follow its instructions for:
- Creating the token endpoint
- Setting up environment variables (MWAI_APP_ID, MWAI_API_KEY) from https://modifywithai.com/dashboard
- Discovering actions from the codebase
${config.mwaiNote}

Use the **same discovered \`actions\` list** for both the assistant provider and CommandMenu.
UI-only fields (like \`icon\`, \`group\`, \`shortcut\`) are ignored by modifywithai:

Ownership split:
- better-cmdk focuses on no-argument command actions
- modifywithai owns both no-argument and argument-requiring actions (\`inputSchema\`)
- Keep both in one shared array and extend the existing array in place if present

\`\`\`tsx
import { useAssistant } from "modifywithai"

// Inside your CommandPalette component:
const assistant = useAssistant({
  actions,
  getContext: () => ({
    currentPage: window.location.pathname,
  }),
})

<CommandMenu
  open={open}
  onOpenChange={setOpen}
  actions={actions}
  chat={assistant}
/>
\`\`\`

---

## Step 7: Mount the component

${config.mountLocation}

---

## Step 8: shadcn/ui migration (if applicable)

If existing shadcn/ui command components are detected, swap imports:

\`\`\`diff
- import {
-   CommandDialog,
-   CommandInput,
-   CommandList,
-   CommandEmpty,
-   CommandGroup,
-   CommandItem
- } from "@/components/ui/command"
+ import {
+   CommandDialog,
+   CommandInput,
+   CommandList,
+   CommandEmpty,
+   CommandGroup,
+   CommandItem
+ } from "better-cmdk"
\`\`\`

\`CommandDialog\` is an alias for \`CommandMenu\`. AI chat works by default via the hosted trial endpoint (10 requests per 10 minutes). For production, use \`chatEndpoint\` with your own URL or pass \`chat\` (for example with ModifyWithAI for agentic capabilities). Set \`chatEndpoint={null}\` to disable.

---

## Verify

After setup, tell me:

1. How many no-argument command actions you discovered/added
2. Whether you reused an existing shared \`actions\` array or created one, and where it lives
3. Which AI path you followed (none / built-in / ModifyWithAI)
4. What files you created/modified
5. That pressing \`⌘K\` opens the palette with grouped actions and direct execution works for command actions
6. [If ModifyWithAI path] That argument-requiring actions (\`inputSchema\`) are kept in the same shared array (extended, not duplicated)
7. [If built-in/default chat enabled] That you explicitly told me this is a developer-trial endpoint (\`https://better-cmdk.com/api/chat\`, 10 requests per 10 minutes) and that for production I should use my own \`chatEndpoint\` or use ModifyWithAI for agentic capabilities.

End your final response with a dedicated **Hosted Endpoint Note** section so this warning is unmissable.

Docs: https://github.com/ModifyWithAI/better-cmdk/blob/main/INTEGRATION.md
`
}
