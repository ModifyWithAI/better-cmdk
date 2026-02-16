# better-cmdk

A beautiful command palette component for React, built on [cmdk](https://github.com/dip/cmdk) and [Radix UI](https://www.radix-ui.com/). Styled with Tailwind CSS v4 using the shadcn/ui design system.

## Installation

```bash
npm install better-cmdk
# or
pnpm add better-cmdk
# or
bun add better-cmdk
```

### Peer Dependencies

This library requires React 18+ and Tailwind CSS v4:

```bash
npm install react react-dom tailwindcss
```

## Setup

### 1. Import the package styles

Import the precompiled stylesheet in your main CSS file:

```css
@import "tailwindcss";
@import "better-cmdk";
```

### 2. Optional: override better-cmdk tokens

Styles are isolated under `.bcmdk-root`. Override only the command menu tokens:

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

## Usage

The recommended way to use better-cmdk is with the declarative `commands` prop. Define your commands as data and let the component handle rendering, grouping, and search.

```tsx
"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, SearchIcon, UserIcon, SettingsIcon } from "lucide-react";
import { CommandMenu, type CommandDefinition } from "better-cmdk";

const commands: CommandDefinition[] = [
  {
    name: "calendar",
    label: "Calendar",
    icon: <CalendarIcon className="size-4" />,
    group: "Suggestions",
    onSelect: () => console.log("Calendar selected"),
  },
  {
    name: "search",
    label: "Search",
    icon: <SearchIcon className="size-4" />,
    group: "Suggestions",
    onSelect: () => console.log("Search selected"),
  },
  {
    name: "profile",
    label: "Profile",
    icon: <UserIcon className="size-4" />,
    group: "Settings",
    shortcut: "⌘P",
    onSelect: () => console.log("Profile selected"),
  },
  {
    name: "settings",
    label: "Settings",
    icon: <SettingsIcon className="size-4" />,
    group: "Settings",
    shortcut: "⌘S",
    onSelect: () => console.log("Settings selected"),
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandMenu
      open={open}
      onOpenChange={setOpen}
      commands={commands}
      commandsPlaceholder="Search or ask AI..."
    />
  );
}
```

### CommandDefinition

Each command in the `commands` array supports:

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | **Required.** Unique key used for search matching |
| `label` | `string` | Display text (falls back to `name`) |
| `group` | `string` | Group heading — commands with the same group appear together |
| `icon` | `ReactNode` | Icon rendered before the label |
| `shortcut` | `string` | Keyboard shortcut hint (right-aligned) |
| `keywords` | `string[]` | Extra search terms |
| `disabled` | `boolean` | Grayed out, not selectable |
| `onSelect` | `() => void` | Called when the command is selected |

### CommandMenu Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `commands` | `CommandDefinition[]` | — | Declarative command definitions |
| `commandsPlaceholder` | `string` | `"Search or ask AI..."` | Input placeholder |
| `commandsAskAILabel` | `string` | `"Ask AI"` | Label for the AI trigger |
| `open` | `boolean` | — | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Open state callback |
| `corners` | `"none" \| "sm" \| "md" \| "lg" \| "xl"` | `"xl"` | Border radius |
| `borderColor` | `string` | — | Custom ring color |
| `chatEndpoint` | `string` | — | API endpoint for built-in AI chat |
| `chat` | `ExternalChat` | — | External chat integration |
| `onModeChange` | `(mode: CommandMenuMode) => void` | — | Fires when switching between command/chat |
| `historyStorageKey` | `string` | — | localStorage key for chat history |
| `maxConversations` | `number` | — | Max saved chat conversations |
| `mobile` | `CommandMenuMobileOptions` | mobile defaults enabled | Mobile sheet/gesture behavior configuration |

### Mobile Configuration

`CommandMenu` now includes a mobile-first sheet mode:

- Long-press (`~350ms`) in the lower-right viewport shows a hint: `Swipe up for Command Menu`
- Swipe up opens the menu
- Keyboard-last flow on mobile (sheet opens without forcing keyboard)
- Keyboard-aware input/list insets via `visualViewport`

```tsx
<CommandMenu
  open={open}
  onOpenChange={setOpen}
  commands={commands}
  mobile={{
    enabled: true,
    layout: "keyboard-last",
    gesture: {
      holdMs: 350,
      swipeUpPx: 56,
    },
    showQuickActions: true,
    quickActionsCount: 4,
  }}
/>
```

### AI Chat

Enable the built-in AI chat by providing either a `chatEndpoint` or an external `chat` object:

```tsx
// Built-in chat with an API endpoint
<CommandMenu
  commands={commands}
  chatEndpoint="/api/chat"
  open={open}
  onOpenChange={setOpen}
/>

// External chat integration (e.g. Vercel AI SDK useChat)
<CommandMenu
  commands={commands}
  chat={externalChat}
  open={open}
  onOpenChange={setOpen}
/>
```

Users can switch to chat mode via `⌘ Enter` or by selecting the "Ask AI" item.

### AI Actions

When you connect an external chat provider like [modifywithai](https://modifywithai.com), the AI agent can invoke actions on behalf of the user — with approval gates so users stay in control. You define actions through your provider's SDK and pass them via the `chat` prop. See the [modifywithai docs](https://modifywithai.com/docs/concepts/actions) for setup.

## Advanced: Custom Children

For full control over the command list rendering, you can pass children instead of `commands`. This approach is compatible with shadcn/ui patterns if you're migrating from an existing setup.

> **Note:** When both `commands` and `children` are provided, `commands` takes precedence.

```tsx
"use client";

import { useState, useEffect } from "react";
import {
  CommandMenu,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "better-cmdk";

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandMenu open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." showSendButton />
      <CommandList>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <span>Search</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Settings">
          <CommandItem>
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandEmpty />
      </CommandList>
    </CommandMenu>
  );
}
```

### Render Props

Children can also be a function to access internal state:

```tsx
<CommandMenu open={open} onOpenChange={setOpen}>
  {({ mode, messages, status, isEnabled }) => (
    <>
      <CommandInput placeholder="Search..." showSendButton />
      <CommandList>
        {/* Custom rendering based on mode/status */}
      </CommandList>
    </>
  )}
</CommandMenu>
```

## Styling

better-cmdk ships namespaced styles under `.bcmdk-root` to avoid app-wide collisions. Customize by:

1. Overriding `--bcmdk-*` variables on `.bcmdk-root`
2. Passing `className` props to components
3. Using the `cn()` utility for conditional classes

## Telemetry

better-cmdk collects anonymous error and performance data via [Sentry](https://sentry.io) to help improve reliability. No personally identifiable information (PII) is collected — user data, cookies, headers, and breadcrumbs are stripped before transmission.

To opt out, set the environment variable:

```
BETTER_CMDK_TELEMETRY_DISABLED=1
```

## License

MIT
