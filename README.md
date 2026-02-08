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

### 1. Configure Tailwind to scan the package

Add the package to your Tailwind CSS sources in your main CSS file:

```css
@import "tailwindcss";
@source "node_modules/better-cmdk";
```

### 2. Add CSS variables

Add the required CSS variables to your global styles:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
  --radius: 0.5rem;
}

@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
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

The component uses Tailwind CSS with the shadcn/ui design tokens. Customize by:

1. Overriding CSS variables
2. Passing `className` props to components
3. Using the `cn()` utility for conditional classes

## License

MIT
