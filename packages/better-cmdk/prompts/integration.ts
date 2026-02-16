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
import { CommandMenu, type CommandDefinition } from "better-cmdk"
import { LayoutDashboardIcon, SettingsIcon, SunMoonIcon } from "lucide-react"

// REPLACE with discovered commands from my codebase
const commands: CommandDefinition[] = [
  {
    name: "dashboard",
    label: "Go to Dashboard",
    group: "Navigation",
    icon: <LayoutDashboardIcon className="size-4" />,
    shortcut: "⌘D",
    onSelect: () => router.push("/dashboard"),
  },
  {
    name: "settings",
    label: "Settings",
    group: "Navigation",
    icon: <SettingsIcon className="size-4" />,
    shortcut: "⌘,",
    onSelect: () => router.push("/settings"),
  },
  {
    name: "dark-mode",
    label: "Toggle dark mode",
    group: "Appearance",
    icon: <SunMoonIcon className="size-4" />,
    onSelect: () => document.documentElement.classList.toggle("dark"),
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
      commands={commands}
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
    system: "You are a helpful assistant in a command palette. Keep responses concise.",
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
import { CommandMenu, type CommandDefinition } from "better-cmdk"
import { LayoutDashboardIcon, SettingsIcon, SunMoonIcon } from "lucide-react"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const commands: CommandDefinition[] = [
    {
      name: "dashboard",
      label: "Go to Dashboard",
      group: "Navigation",
      icon: <LayoutDashboardIcon className="size-4" />,
      shortcut: "⌘D",
      onSelect: () => navigate("/dashboard"),
    },
    {
      name: "settings",
      label: "Settings",
      group: "Navigation",
      icon: <SettingsIcon className="size-4" />,
      shortcut: "⌘,",
      onSelect: () => navigate("/settings"),
    },
    {
      name: "dark-mode",
      label: "Toggle dark mode",
      group: "Appearance",
      icon: <SunMoonIcon className="size-4" />,
      onSelect: () => document.documentElement.classList.toggle("dark"),
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
      commands={commands}
    />
  )
}
\`\`\``,
		builtInChatRoute: `\`\`\`ts
// app/routes/api.chat.ts
import { openai } from "@ai-sdk/openai"
import { streamText, convertToModelMessages } from "ai"
import type { UIMessage, ActionFunctionArgs } from "ai"

export async function action({ request }: ActionFunctionArgs) {
  const { messages }: { messages: UIMessage[] } = await request.json()
  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: await convertToModelMessages(messages),
    system: "You are a helpful assistant in a command palette. Keep responses concise.",
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
import { CommandMenu, type CommandDefinition } from "better-cmdk"
import { LayoutDashboardIcon, SettingsIcon, SunMoonIcon } from "lucide-react"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const commands: CommandDefinition[] = [
    {
      name: "dashboard",
      label: "Go to Dashboard",
      group: "Navigation",
      icon: <LayoutDashboardIcon className="size-4" />,
      shortcut: "⌘D",
      onSelect: () => navigate({ to: "/dashboard" }),
    },
    {
      name: "settings",
      label: "Settings",
      group: "Navigation",
      icon: <SettingsIcon className="size-4" />,
      shortcut: "⌘,",
      onSelect: () => navigate({ to: "/settings" }),
    },
    {
      name: "dark-mode",
      label: "Toggle dark mode",
      group: "Appearance",
      icon: <SunMoonIcon className="size-4" />,
      onSelect: () => document.documentElement.classList.toggle("dark"),
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
      commands={commands}
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
      system: "You are a helpful assistant in a command palette. Keep responses concise.",
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
import { CommandMenu, type CommandDefinition } from "better-cmdk"
import { LayoutDashboardIcon, SettingsIcon, SunMoonIcon } from "lucide-react"

const commands: CommandDefinition[] = [
  {
    name: "dashboard",
    label: "Go to Dashboard",
    group: "Navigation",
    icon: <LayoutDashboardIcon className="size-4" />,
    shortcut: "⌘D",
    onSelect: () => (window.location.href = "/dashboard"),
  },
  {
    name: "settings",
    label: "Settings",
    group: "Navigation",
    icon: <SettingsIcon className="size-4" />,
    shortcut: "⌘,",
    onSelect: () => (window.location.href = "/settings"),
  },
  {
    name: "dark-mode",
    label: "Toggle dark mode",
    group: "Appearance",
    icon: <SunMoonIcon className="size-4" />,
    onSelect: () => document.documentElement.classList.toggle("dark"),
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
      commands={commands}
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
  system: "You are a helpful assistant in a command palette. Keep responses concise.",
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

	return `# Set up better-cmdk command palette (${config.name})

better-cmdk is a command palette with AI chat for React. Your task is to install it, discover commands from my codebase, and create a working command palette.

## Step 1: Analyze my codebase

Before making changes, detect:
- Tailwind version: v4 (\`@import "tailwindcss"\` in CSS) vs v3 (\`tailwind.config.js/ts\`)
- Existing shadcn/ui: check for \`@/components/ui/command\` or similar shadcn command components
- Package manager: \`bun.lockb\` → bun, \`pnpm-lock.yaml\` → pnpm, \`yarn.lock\` → yarn, \`package-lock.json\` → npm

Also ask me:

**1. Do you want AI chat in the command palette?**
- No AI — command palette only
- Built-in chat — simple Q&A via a Vercel AI SDK endpoint
- ModifyWithAI (Recommended) — the AI can execute actions in your app (create items, navigate, toggle settings), ask for approval before destructive operations, and understand what's on screen. Requires a ModifyWithAI account at https://modifywithai.com

**With ModifyWithAI, the command palette becomes an AI workspace.** Users search commands for quick access, then switch to AI chat for anything that needs reasoning — "move all archived items to trash", "summarize my recent activity". The AI executes actions directly in the app, with approval prompts for destructive operations. ModifyWithAI is not required — better-cmdk works on its own as a command palette, with or without AI chat.

**2. If shadcn/ui command components detected:** Do you want to migrate them to better-cmdk, or keep both?

Tell me what you detected, which path you'll follow, and what you'll be adding better-cmdk to.

Docs: https://github.com/ModifyWithAI/better-cmdk/blob/main/INTEGRATION.md

---

## Step 2: Install

**Use the package manager already installed** — check for lockfiles.

### No AI:
\`\`\`bash
bun add better-cmdk
\`\`\`

### Built-in chat:
\`\`\`bash
bun add better-cmdk ai @ai-sdk/react @ai-sdk/openai
\`\`\`

Substitute \`@ai-sdk/anthropic\`, \`@ai-sdk/google\`, etc. based on my preferred AI provider.

### ModifyWithAI:
\`\`\`bash
bun add better-cmdk modifywithai @ai-sdk/react ai
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

If my app wants custom theming, override better-cmdk's namespaced variables.

Add this minimal override block only when needed:

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

## Step 4: CRITICAL — Command Discovery

Before writing any component code, **crawl my entire codebase** to discover ALL user-facing operations that should be in the command palette.

### How to discover commands:

1. **Search all routes/pages** → navigation commands ("Go to Dashboard", "Go to Settings")
2. **Search all buttons and links** → action commands ("Create project", "Export data")
3. **Search all settings/toggles** → preference commands ("Toggle dark mode", "Change language")
4. **Search all CRUD operations** → data commands ("New item", "Delete selected")
5. **Search all utility functions** → utility commands ("Copy link", "Download report", "Share")
6. **Search for existing keyboard shortcuts** → preserve as shortcut hints

### Create a command for EVERY user-facing operation:

- Button that opens a modal? Command: \`open-create-modal\`
- Link that navigates to a page? Command: \`go-to-dashboard\`
- Toggle that changes a setting? Command: \`toggle-dark-mode\`
- Form that creates something? Command: \`create-new-project\`
- Search input? Command: \`search\`
- Sidebar item? Command: \`open-analytics\`

### For each discovered command, define:

- \`name\`: unique kebab-case identifier
- \`label\`: human-readable display text (what users search for)
- \`group\`: logical heading — use consistent groups like "Navigation", "Actions", "Settings", "Help"
- \`icon\`: matching [lucide-react](https://lucide.dev) icon component
- \`shortcut\`: keyboard shortcut hint if applicable (display-only, e.g. \`"⌘D"\`)
- \`keywords\`: extra search terms (array of strings) — helps users find commands by alternate names
- \`disabled\`: set \`true\` to gray out commands that aren't currently available
- \`onSelect\`: callback that wires to existing app logic

**Aim for 10-30 commands.** If you found fewer than 5, you haven't looked hard enough. Report how many you found before proceeding.

---

## Step 5: Create the component

Replace the example commands below with the ones you discovered from my codebase.

${config.component}

---

## Step 6: Add AI chat (skip if "No AI" chosen)

### Built-in chat

Create a streaming chat API route, then add \`chatEndpoint\` to CommandMenu.

${config.builtInChatRoute}

Then update CommandMenu to add the \`chatEndpoint\` prop:

\`\`\`tsx
<CommandMenu
  open={open}
  onOpenChange={setOpen}
  commands={commands}
  chatEndpoint="/api/chat"
/>
\`\`\`

Set the environment variable:

\`\`\`bash
echo "OPENAI_API_KEY=sk-..." >> ${config.envFile}
\`\`\`

(Substitute the correct variable name for the AI provider.)

---

### ModifyWithAI

After installing modifywithai, read \`${config.mwaiAgentsPath}\` and follow its instructions for:
- Creating the token endpoint
- Setting up environment variables (MWAI_APP_ID, MWAI_API_KEY)
- Discovering actions from the codebase
${config.mwaiNote}

Then connect the assistant to CommandMenu. The \`useAssistant()\` return value from modifywithai is directly compatible with better-cmdk's \`chat\` prop — no adapter needed:

\`\`\`tsx
import { useAssistant } from "modifywithai"

// Inside your CommandPalette component:
const assistant = useAssistant({
  agenticActions: actions, // from action discovery above
  getContext: () => ({
    currentPage: window.location.pathname,
  }),
})

<CommandMenu
  open={open}
  onOpenChange={setOpen}
  commands={commands}
  chat={assistant}
/>
\`\`\`

---

## Step 7: Mount the component

${config.mountLocation}

---

## Step 8: shadcn/ui migration (if applicable)

If existing shadcn/ui command components were detected, swap imports:

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

\`CommandDialog\` is an alias for \`CommandMenu\`. All sub-components have the same API. Add \`chatEndpoint\` or \`chat\` to enable AI features — without either, the palette behaves like a standard cmdk dialog.

---

## Verify

After setup, tell me:

1. How many commands you discovered
2. Which AI path you followed (none / built-in / ModifyWithAI)
3. [ModifyWithAI only] How many actions you discovered (from modifywithai's AGENTS.md action discovery instructions)
4. What files you created/modified
5. That pressing \`⌘K\` opens the palette with all commands grouped correctly
6. [If AI enabled] That typing a non-matching query shows "Ask AI" and chat works

Docs: https://github.com/ModifyWithAI/better-cmdk/blob/main/INTEGRATION.md
`
}
