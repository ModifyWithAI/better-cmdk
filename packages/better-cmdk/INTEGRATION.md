# Integration Guide

## Install

```sh
bun add better-cmdk
```

Peer dependencies: `react` (^18 || ^19), `react-dom` (^18 || ^19), `typescript` (^5).

## CSS Setup

better-cmdk ships precompiled styles. Import it in your main CSS file:

```css
@import "tailwindcss";
@import "better-cmdk";
```

Styles are isolated under `.bcmdk-root`. Override only better-cmdk tokens as needed:

```css
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
```

Override any variable to match your brand.

---

## Quick Start: Declarative Commands

The simplest way to use better-cmdk. Pass a `commands` array and get grouping, icons, shortcuts, filtering, and AI chat for free.

```tsx
import { useState } from "react"
import { CommandMenu, type CommandDefinition } from "better-cmdk"
import { Settings, User, FileText, Search } from "lucide-react"

const commands: CommandDefinition[] = [
  {
    name: "open-settings",
    label: "Open Settings",
    group: "Navigation",
    icon: <Settings className="size-4" />,
    shortcut: "\u2318,",
    onSelect: () => console.log("settings"),
  },
  {
    name: "open-profile",
    label: "Open Profile",
    group: "Navigation",
    icon: <User className="size-4" />,
    onSelect: () => console.log("profile"),
  },
  {
    name: "search-docs",
    label: "Search Documentation",
    group: "Help",
    icon: <Search className="size-4" />,
    keywords: ["help", "faq"],
    onSelect: () => console.log("docs"),
  },
  {
    name: "changelog",
    label: "View Changelog",
    group: "Help",
    icon: <FileText className="size-4" />,
    onSelect: () => console.log("changelog"),
  },
]

export function App() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <CommandMenu
        open={open}
        onOpenChange={setOpen}
        commands={commands}
        chatEndpoint="/api/chat"
      />
    </>
  )
}
```

### CommandDefinition

| Field | Type | Description |
|---|---|---|
| `name` | `string` | **Required.** Unique key, used as the cmdk value. |
| `label` | `string` | Display text. Falls back to `name`. |
| `group` | `string` | Group heading. Same string = same group. |
| `icon` | `ReactNode` | Rendered before the label. |
| `shortcut` | `string` | Display-only shortcut hint, right-aligned. |
| `keywords` | `string[]` | Extra search terms for cmdk filtering. |
| `disabled` | `boolean` | Grayed out and not selectable. |
| `onSelect` | `() => void` | Called when the command is selected. |

Commands are grouped by `group`, preserving the order they appear in the array. Commands without a `group` render first with no heading.

### Customizing labels

```tsx
<CommandMenu
  commands={commands}
  commandsPlaceholder="Type a command..."   // default: "Search or ask AI..."
  commandsAskAILabel="Chat with AI"         // default: "Ask AI"
  mobile={{ layout: "keyboard-last" }}
/>
```

---

## Composition API (Children)

For full control, pass children directly. This is the same pattern as shadcn/ui's command components.

```tsx
import {
  CommandMenu,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
  CommandShortcut,
} from "better-cmdk"

export function App() {
  const [open, setOpen] = useState(false)

  return (
    <CommandMenu open={open} onOpenChange={setOpen} chatEndpoint="/api/chat">
      <CommandInput placeholder="Search or ask AI..." showSendButton />
      <CommandList>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => console.log("settings")}>
            Open Settings
            <CommandShortcut>{"\u2318,"}</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => console.log("profile")}>
            Open Profile
          </CommandItem>
        </CommandGroup>
        <CommandEmpty label="Ask AI" />
      </CommandList>
    </CommandMenu>
  )
}
```

`commands` and `children` are mutually exclusive. If both are provided, `commands` wins and a dev warning is logged.

---

## Migrating from shadcn/ui

If you already use shadcn's command components, change the import source:

```diff
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
```

- `CommandDialog` is an alias for `CommandMenu` (dialog with AI support).
- `CommandInput`, `CommandList`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator` have the same API.
- `CommandEmpty` from shadcn is automatically ignored with a dev console warning. The AI empty state replaces it.
- `Command` is exported for inline (non-dialog) usage.

Add `chatEndpoint` or `chat` to enable AI features. Without either, the palette behaves like a standard cmdk dialog.

---

## AI Chat

### Internal chat (chatEndpoint)

Point to any AI SDK-compatible streaming endpoint:

```tsx
<CommandMenu
  open={open}
  onOpenChange={setOpen}
  chatEndpoint="/api/chat"
  historyStorageKey="my-app-chat"
  maxConversations={20}
/>
```

The library uses `@ai-sdk/react`'s `useChat` with `DefaultChatTransport` internally. Conversations auto-save to `localStorage` under the key you provide.

### External chat

Bring your own chat hook when you need full control over the transport, message handling, or server integration:

```tsx
import { useChat } from "@ai-sdk/react"
import { CommandMenu, type ExternalChat } from "better-cmdk"

function App() {
  const chat = useChat({ api: "/api/chat" })
  const [open, setOpen] = useState(false)

  const externalChat: ExternalChat = {
    messages: chat.messages,
    setMessages: chat.setMessages,
    sendMessage: (msg) => chat.sendMessage({ text: msg.text }),
    status: chat.status,
    error: chat.error,
  }

  return (
    <CommandMenu open={open} onOpenChange={setOpen} chat={externalChat} />
  )
}
```

### ExternalChat interface

```ts
interface ExternalChat {
  messages: UIMessage[]
  setMessages?: (messages: UIMessage[] | ((msgs: UIMessage[]) => UIMessage[])) => void
  sendMessage: (message: { text: string }) => void
  status: "ready" | "submitted" | "streaming" | "error"
  error: Error | null
  addToolApprovalResponse?: (response: { id: string; approved: boolean }) => void
  agenticActions?: readonly CommandAction[]
}
```

---

## Agentic Actions

Pass actions via external chat to show AI-executable actions in the command list. When a user selects one, it starts a chat with the action label as the initial message.

```tsx
const externalChat: ExternalChat = {
  // ...chat fields
  agenticActions: [
    {
      name: "summarize-page",
      label: "Summarize this page",
      execute: (opts) => { /* called by the AI */ },
    },
    {
      name: "translate",
      label: "Translate selection",
      execute: (opts) => { /* ... */ },
    },
  ],
}
```

Or pass actions directly to `CommandList`:

```tsx
<CommandList actions={actions} actionsHeading="AI Actions" />
```

---

## Chat History

Conversations are automatically persisted to `localStorage` when a chat completes (status transitions from streaming/submitted to idle). Recent conversations appear in the command list.

```tsx
<CommandMenu
  historyStorageKey="my-app-chat-history"  // default: "cmdk-chat-history"
  maxConversations={50}                     // default: 50
/>
```

You can also use the hook directly:

```tsx
import { useChatHistory } from "better-cmdk"

const history = useChatHistory({
  storageKey: "my-key",
  maxConversations: 20,
  messages,
  setMessages,
})

// history.conversations - all saved conversations
// history.startNewChat() - clear messages and start fresh
// history.loadConversation(id) - restore a previous conversation
// history.saveCurrentConversation() - manually trigger save
```

---

## Render Prop

Access mode, messages, and status to conditionally render different UI:

```tsx
<CommandMenu open={open} onOpenChange={setOpen} chatEndpoint="/api/chat">
  {({ mode, messages, status, isEnabled }) => (
    <>
      <CommandInput
        placeholder={mode === "chat" ? "Ask AI..." : "Search..."}
        showSendButton
      />
      <CommandList>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => {}}>Do something</CommandItem>
        </CommandGroup>
        <CommandEmpty />
      </CommandList>
    </>
  )}
</CommandMenu>
```

---

## Props Reference

### CommandMenu

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | - | Controls dialog visibility. |
| `onOpenChange` | `(open: boolean) => void` | - | Called when visibility changes. |
| `commands` | `CommandDefinition[]` | - | Declarative command list. Mutually exclusive with children. |
| `commandsPlaceholder` | `string` | `"Search or ask AI..."` | Input placeholder when using `commands`. |
| `commandsAskAILabel` | `string` | `"Ask AI"` | Label for the AI trigger when using `commands`. |
| `chatEndpoint` | `string \| null` | `null` | API endpoint for internal chat. |
| `chat` | `ExternalChat` | - | External chat implementation. |
| `askAILabel` | `string` | - | Label for the AI trigger (children mode). |
| `onModeChange` | `(mode: "command" \| "chat") => void` | - | Called when switching between command and chat. |
| `historyStorageKey` | `string` | `"cmdk-chat-history"` | localStorage key for chat history. |
| `maxConversations` | `number` | `50` | Maximum saved conversations. |
| `mobile` | `CommandMenuMobileOptions` | Mobile defaults enabled | Mobile sheet/gesture/keyboard behavior. |
| `title` | `string` | `"Command Palette"` | Dialog title (screen reader only). |
| `description` | `string` | `"Search for a command to run..."` | Dialog description (screen reader only). |
| `corners` | `"none" \| "sm" \| "md" \| "lg" \| "xl"` | `"xl"` | Border radius preset. |
| `borderColor` | `string` | - | Custom ring/border color. |
| `className` | `string` | - | Class for the dialog content. |
| `children` | `ReactNode \| (context) => ReactNode` | Default UI | Composition children or render prop. |

### `mobile` options

```ts
type CommandMenuMobileOptions = {
  enabled?: boolean // default: true
  breakpoint?: number // default: 900
  layout?: "keyboard-last" // default: "keyboard-last"
  gesture?: false | {
    enabled?: boolean // default: true
    holdMs?: number // default: 350
    swipeUpPx?: number // default: 56
  }
  showQuickActions?: boolean // default: true
  quickActionsCount?: number // default: 4
}
```

Gesture behavior uses a lower-right activation zone by default: hold, then swipe up to open.

### CommandInput

| Prop | Type | Default | Description |
|---|---|---|---|
| `placeholder` | `string` | - | Input placeholder (overridden to "Ask AI..." in chat mode). |
| `showSendButton` | `boolean` | `false` | Show send button in chat mode. |
| `className` | `string` | - | Class for the input element. |

### CommandList

| Prop | Type | Default | Description |
|---|---|---|---|
| `actions` | `readonly CommandAction[]` | - | Actions to render as items. Falls back to `agenticActions` from context. |
| `actionsHeading` | `string` | `"Actions"` | Heading for the actions group. |
| `className` | `string` | - | Class for the list container. |

### CommandEmpty

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `"Ask AI"` | Label for the AI trigger item. |
| `className` | `string` | - | Class for the empty state. |

---

## Keyboard Shortcuts

| Key | Mode | Action |
|---|---|---|
| Type | Command | Filters commands via cmdk |
| Enter | Command | Selects highlighted command |
| Enter | Chat | Sends message |
| Cmd+Enter / Ctrl+Enter | Command | Starts chat with current query |
| Cmd+Enter / Ctrl+Enter | Chat | Sends message |
| Escape | Chat | Switches back to command mode |
| Escape | Command | Closes the dialog |

---

## Exports

All components and types are available from the package root:

```tsx
// Components
import {
  CommandMenu,         // Main dialog component
  CommandDialog,       // Alias for CommandMenu (shadcn compat)
  Command,             // Base cmdk wrapper (non-dialog usage)
  CommandContent,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  CommandEmpty,
  CommandDialogContent,
  // Chat
  ChatMessageList,
  ChatLoading,
  ChatEmpty,
  // Messages
  Message,
  MessageContent,
  MessageResponse,
  AssistantMessages,
  // Tool approval
  Confirmation,
  ConfirmationTitle,
  ConfirmationRequest,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationActions,
  ConfirmationAction,
  // Dialog
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  // Context
  CommandMenuProvider,
  useCommandMenuContext,
  // Utilities
  cn,
  Button,
} from "better-cmdk"

// Types
import type {
  CommandDefinition,
  CommandMenuProps,
  CommandAction,
  ExternalChat,
  CommandMenuMode,
  CommandMenuStatus,
  CommandMenuContextValue,
} from "better-cmdk"
```
