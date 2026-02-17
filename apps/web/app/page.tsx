"use client";

import { type CommandDefinition, CommandMenu } from "better-cmdk";
import {
  ArrowUpRight,
  Check,
  Clipboard,
  Code,
  Command,
  Github,
  Hash,
  Moon,
  Plug,
  Search,
  Sparkles,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Logo from "./assets/Cmd-K.svg";

Prism.manual = true;

const flowSteps = [
  {
    number: "01",
    title: "Define action contracts",
    description:
      "Define each action with a name, label, options, and execute handler. Reuse the same actions for search and AI tools.",
  },
  {
    number: "02",
    title: "Attach any chat backend",
    description:
      "Connect modifywithai.com, Vercel AI SDK, or your own endpoint through the ExternalChat interface.",
  },
  {
    number: "03",
    title: "Search, ask, approve",
    description:
      "Users can run actions by typing or asking in natural language. Add approval steps before sensitive actions run.",
  },
];

const providerPills = [
  { label: "modifywithai.com", href: "/integrations/modifywithai" },
  { label: "Vercel AI SDK", href: "/integrations/vercel-ai-sdk" },
  { label: "Custom ExternalChat", href: "/integrations/custom-external-chat" },
  { label: "Self-hosted endpoint", href: "/integrations/self-hosted-endpoint" },
];

const tickerItems = [
  { id: "a-define", text: "Define actions once" },
  { id: "a-search", text: "Search commands instantly" },
  { id: "a-ai", text: "AI can call the same actions" },
  { id: "a-approve", text: "Require approval for sensitive actions" },
  { id: "a-provider", text: "Use any ExternalChat provider" },
  { id: "a-ship", text: "No custom command plumbing" },
  { id: "b-define", text: "Define actions once" },
  { id: "b-search", text: "Search commands instantly" },
  { id: "b-ai", text: "AI can call the same actions" },
  { id: "b-approve", text: "Require approval for sensitive actions" },
  { id: "b-provider", text: "Use any ExternalChat provider" },
  { id: "b-ship", text: "No custom command plumbing" },
];

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const highlightedTokens = useMemo(() => {
    const normalized = language.toLowerCase();
    const grammar =
      Prism.languages[normalized] ??
      Prism.languages.tsx ??
      Prism.languages.typescript ??
      Prism.languages.markup;

    return Prism.tokenize(code, grammar);
  }, [code, language]);

  const renderToken = (token: string | Prism.Token, key: string): ReactNode => {
    if (typeof token === "string") {
      return token;
    }

    const aliases = token.alias
      ? Array.isArray(token.alias)
        ? token.alias
        : [token.alias]
      : [];

    const className = ["token", token.type, ...aliases].join(" ");

    const content = Array.isArray(token.content)
      ? token.content.map((inner: string | Prism.Token, index: number) =>
          renderToken(inner, `${key}-${index}`),
        )
      : typeof token.content === "string"
        ? token.content
        : renderToken(token.content, `${key}-0`);

    return (
      <span key={key} className={className}>
        {content}
      </span>
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="overflow-hidden border-4 border-foreground bg-card text-foreground">
      <div className="flex items-center justify-between border-b-2 border-foreground/20 px-4 py-3">
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-foreground/78">
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 border-2 border-foreground/45 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-foreground/86 transition-colors hover:bg-foreground hover:text-background"
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Clipboard className="size-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed">
        <code className={`code-highlight language-${language}`}>
          {highlightedTokens.map((token: string | Prism.Token, index: number) =>
            renderToken(token, `token-${index}`),
          )}
        </code>
      </pre>
    </div>
  );
}

export default function Home() {
  const [open, setOpen] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Copied");
  const [agentPromptCopied, setAgentPromptCopied] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  const howItWorksRef = useRef<HTMLElement>(null);
  const extensibilityRef = useRef<HTMLElement>(null);
  const codeRef = useRef<HTMLElement>(null);
  const setupRef = useRef<HTMLElement>(null);
  const toastTimerRef = useRef<number | null>(null);
  const promptCopiedTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
      if (promptCopiedTimerRef.current !== null) {
        window.clearTimeout(promptCopiedTimerRef.current);
      }
    },
    [],
  );

  const showCopiedToast = (message: string) => {
    setToastMessage(message);
    setShowCopyToast(true);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setShowCopyToast(false);
    }, 1900);
  };

  const agentSetupPrompt = `Install better-cmdk in this project using the package manager already used here (npm, pnpm, yarn, or bun).

After installation, read and follow:
node_modules/better-cmdk/AGENTS.md

Use the instructions there to complete the integration.`;

  const copyAgentSetupPrompt = () => {
    navigator.clipboard.writeText(agentSetupPrompt);
    setAgentPromptCopied(true);
    if (promptCopiedTimerRef.current !== null) {
      window.clearTimeout(promptCopiedTimerRef.current);
    }
    promptCopiedTimerRef.current = window.setTimeout(() => {
      setAgentPromptCopied(false);
    }, 1000);
    setShowSetupModal(true);
    showCopiedToast("AI setup prompt copied");
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    setOpen(false);
  };

  const scrollTo = (ref: React.RefObject<HTMLElement | null>) => {
    setOpen(false);
    window.setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const openExternal = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!showSetupModal) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSetupModal(false);
      }
    };

    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [showSetupModal]);

  const commands: CommandDefinition[] = [
    {
      name: "open-demo",
      label: "Open command palette",
      group: "Actions",
      icon: <Search className="size-4" />,
      onSelect: () => setOpen(true),
    },
    {
      name: "toggle-theme",
      label: "Toggle theme",
      group: "Actions",
      icon: <Moon className="size-4" />,
      onSelect: toggleTheme,
    },
    {
      name: "copy-agent-prompt",
      label: "Copy agent setup prompt",
      group: "Actions",
      icon: <Sparkles className="size-4" />,
      onSelect: () => {
        copyAgentSetupPrompt();
        setOpen(false);
      },
    },
    {
      name: "how-it-works",
      label: "Jump to flow",
      group: "Navigate",
      icon: <Hash className="size-4" />,
      onSelect: () => scrollTo(howItWorksRef),
    },
    {
      name: "setup-options",
      label: "Jump to setup options",
      group: "Navigate",
      icon: <Hash className="size-4" />,
      onSelect: () => scrollTo(setupRef),
    },
    {
      name: "providers",
      label: "Jump to provider section",
      group: "Navigate",
      icon: <Plug className="size-4" />,
      onSelect: () => scrollTo(extensibilityRef),
    },
    {
      name: "code",
      label: "Jump to code example",
      group: "Navigate",
      icon: <Code className="size-4" />,
      onSelect: () => scrollTo(codeRef),
    },
    {
      name: "docs",
      label: "Open docs",
      group: "Links",
      icon: <ArrowUpRight className="size-4" />,
      onSelect: () => openExternal("https://better-cmdk.com/docs"),
    },
    {
      name: "github",
      label: "GitHub",
      group: "Links",
      icon: <Github className="size-4" />,
      onSelect: () =>
        openExternal("https://github.com/ModifyWithAI/better-cmdk"),
    },
    {
      name: "modifywithai",
      label: "modifywithai.com",
      group: "Links",
      icon: <Sparkles className="size-4" />,
      onSelect: () => openExternal("https://modifywithai.com"),
    },
  ];

  const usageCode = `const actions = [
  {
    name: "setView",
    label: "Change dashboard view",
    options: { view: { type: "string", required: true } },
    execute: ({ view }) => setView(view),
  },
  {
    name: "toggleTheme",
    label: "Toggle theme",
    execute: () =>
      setTheme((theme) => (theme === "dark" ? "light" : "dark")),
  },
];

<CommandMenu commands={actions} />`;

  return (
    <div className="relative min-h-screen overflow-x-clip pb-10">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-background" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.12] [background-image:linear-gradient(to_right,hsl(var(--foreground))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground))_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="pointer-events-none fixed -top-20 -right-12 -z-10 h-44 w-44 rotate-12 border-4 border-foreground bg-secondary" />
      <div className="pointer-events-none fixed bottom-20 -left-16 -z-10 h-32 w-32 -rotate-12 border-4 border-foreground bg-card" />

      <nav className="sticky top-0 z-40 border-b-4 border-foreground bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.16em]">
            <Image
              src={Logo}
              alt="better-cmdk logo"
              width={30}
              height={30}
              className="dark:invert"
            />
            better-cmdk
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-10 items-center gap-2 border-2 border-foreground bg-card px-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-transform hover:-translate-y-0.5"
            >
              <Sun className="size-3.5 dark:hidden" />
              <Moon className="hidden size-3.5 dark:block" />
              <span className="dark:hidden">Dark</span>
              <span className="hidden dark:block">Light</span>
            </button>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-10 items-center gap-2 border-2 border-foreground bg-foreground px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-background transition-transform hover:-translate-y-0.5"
            >
              <Search className="size-3.5" />
              Demo
              <kbd className="hidden border border-background/60 px-1 font-mono text-[10px] sm:inline-flex">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-5 pt-14 pb-18 sm:pt-18">
          <p
            className="animate-rise inline-flex border-2 border-foreground bg-card px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em]"
            style={{ animationDelay: "40ms" }}
          >
            AI command menu for React
          </p>

          <h1
            className="font-display animate-rise mt-7 text-balance text-[clamp(3.25rem,15vw,10rem)] leading-[0.82] uppercase"
            style={{ animationDelay: "120ms" }}
          >
            Command.
            <span className="mt-1 block w-fit bg-foreground px-3 pt-[0.08em] pb-[0.02em] text-background">
              Chat. Execute.
            </span>
          </h1>

          <p
            className="animate-rise mt-7 max-w-2xl text-balance font-mono text-sm leading-relaxed uppercase tracking-[0.08em] text-foreground/90 sm:text-base"
            style={{ animationDelay: "220ms" }}
          >
            better-cmdk combines fuzzy search, AI chat, and action approvals in
            one menu. Define actions once, then reuse them in command mode and
            AI mode.
          </p>

          <div
            className="animate-rise mt-9 flex flex-col gap-4 sm:flex-row sm:items-center"
            style={{ animationDelay: "320ms" }}
          >
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-12 items-center gap-2 border-4 border-foreground bg-foreground px-5 font-mono text-xs uppercase tracking-[0.16em] text-background transition-transform hover:-translate-y-1"
            >
              <Command className="size-4" />
              Open live demo
              <span className="text-[10px] tracking-[0.08em] sm:hidden">
                Long-press bottom right
              </span>
              <kbd className="hidden border border-background/60 px-1 text-[10px] sm:inline-flex">
                ⌘K
              </kbd>
            </button>
            <button
              type="button"
              onClick={copyAgentSetupPrompt}
              className="inline-flex h-12 items-center gap-2 border-4 border-foreground bg-card px-5 font-mono text-xs uppercase tracking-[0.16em] transition-transform hover:-translate-y-1"
            >
              <Clipboard className="size-4" />
              Copy AI Setup Prompt
            </button>
          </div>

          <div className="mt-12 overflow-hidden border-4 border-foreground bg-foreground py-2 text-background">
            <div className="animate-track flex min-w-max items-center gap-8 pr-8 font-mono text-[11px] uppercase tracking-[0.2em]">
              {tickerItems.map((item) => (
                <span key={item.id}>{item.text}</span>
              ))}
            </div>
          </div>
        </section>

        <section ref={howItWorksRef} className="mx-auto max-w-6xl px-5 py-16">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <h2 className="font-display text-balance text-[clamp(2.8rem,9vw,6.5rem)] leading-[0.84] uppercase">
              Minimal Flow
            </h2>
            <p className="max-w-xs text-balance border-2 border-foreground bg-card px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/90">
              Three blocks: actions, provider, command menu.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {flowSteps.map((step) => (
              <article
                key={step.number}
                className="border-4 border-foreground bg-card p-5 transition-transform hover:-translate-y-1"
              >
                <p className="font-display text-6xl leading-none">
                  {step.number}
                </p>
                <h3 className="mt-3 text-balance font-mono text-sm font-semibold uppercase tracking-[0.12em]">
                  {step.title}
                </h3>
                <p className="mt-3 text-balance font-mono text-sm leading-relaxed text-foreground/90">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          ref={extensibilityRef}
          className="border-y-4 border-foreground bg-foreground text-background"
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-background/88">
                Provider Integration
              </p>
              <h2 className="font-display mt-4 text-balance text-[clamp(2.8rem,8vw,6.5rem)] leading-[0.84] uppercase">
                Any Provider.
                <span className="block">Same Commands.</span>
              </h2>
              <p className="mt-4 max-w-xl text-balance font-mono text-sm leading-relaxed uppercase tracking-[0.08em] text-background/92">
                Pass an ExternalChat provider object or set a chat endpoint.
                better-cmdk handles mode switching, streaming responses, and
                action approval prompts.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {providerPills.map((pill) => (
                  <Link
                    key={pill.label}
                    href={pill.href}
                    className="border-2 border-background px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors hover:bg-background hover:text-foreground"
                  >
                    {pill.label}
                  </Link>
                ))}
                <Link
                  href="/integrations"
                  className="inline-flex items-center justify-between gap-2 border-2 border-background px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors hover:bg-background hover:text-foreground sm:col-span-2"
                >
                  Browse All Integration Guides
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </div>

            <div className="self-end border-4 border-background bg-background p-5 text-foreground">
              <div className="border-2 border-foreground px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em]">
                1. Chat provider
              </div>
              <div className="py-2 text-center font-display text-4xl leading-none">
                ↓
              </div>
              <div className="border-2 border-foreground px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em]">
                2. better-cmdk CommandMenu
              </div>
              <div className="py-2 text-center font-display text-4xl leading-none">
                ↓
              </div>
              <div className="border-2 border-foreground px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em]">
                3. Shared action definitions
              </div>
              <div className="py-2 text-center font-display text-4xl leading-none">
                ↓
              </div>
              <div className="border-2 border-foreground px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em]">
                4. User approves action run
              </div>
            </div>
          </div>
        </section>

        <section ref={codeRef} className="mx-auto max-w-6xl px-5 py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-balance text-[clamp(2.6rem,8vw,5.5rem)] leading-[0.86] uppercase">
              Wire It Once
            </h2>
            <p className="max-w-sm text-balance font-mono text-sm uppercase tracking-[0.08em] text-foreground/90">
              One action list powers command search and AI tool calls.
            </p>
          </div>

          <CodeBlock code={usageCode} language="tsx" />
        </section>

        <section ref={setupRef} className="mx-auto max-w-6xl px-5 pb-16">
          <div className="border-4 border-foreground bg-secondary p-8 sm:p-10">
            <p className="inline-flex border-2 border-foreground bg-card px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em]">
              Setup Options
            </p>
            <h2 className="font-display mt-4 text-balance text-[clamp(2.4rem,8vw,5.8rem)] leading-[0.84] uppercase text-foreground">
              Two Setup Methods
            </h2>
            <p className="mt-4 max-w-3xl text-balance font-mono text-sm leading-relaxed uppercase tracking-[0.08em] text-foreground/92">
              Fastest path: copy the agent prompt and run it in your coding
              agent. Manual path: follow the docs and wire each step yourself.
            </p>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <article className="border-4 border-foreground bg-card p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="border-2 border-foreground bg-foreground px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-background">
                    Recommended
                  </span>
                  <span className="border-2 border-foreground px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em]">
                    AI Agent Prompt
                  </span>
                </div>

                <p className="mt-4 text-balance font-mono text-sm leading-relaxed uppercase tracking-[0.08em] text-foreground/92">
                  Copy this prompt, paste it into your coding agent, then answer
                  follow-up questions. The agent installs better-cmdk and
                  follows AGENTS.md.
                </p>

                <button
                  type="button"
                  onClick={copyAgentSetupPrompt}
                  className="mt-5 inline-flex h-11 items-center gap-2 border-4 border-foreground bg-foreground px-4 font-mono text-xs uppercase tracking-[0.14em] text-background transition-transform hover:-translate-y-1"
                >
                  {agentPromptCopied ? (
                    <Check className="size-4" />
                  ) : (
                    <Clipboard className="size-4" />
                  )}
                  {agentPromptCopied ? "Prompt Copied" : "Copy Agent Prompt"}
                </button>

                <div className="mt-5 border-2 border-foreground bg-background p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/84">
                    Prompt Text
                  </p>
                  <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/92">
                    {agentSetupPrompt}
                  </pre>
                </div>
              </article>

              <article className="border-4 border-foreground bg-background p-6">
                <span className="inline-flex border-2 border-foreground px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em]">
                  Manual Setup
                </span>
                <h3 className="font-display mt-4 text-balance text-[clamp(2rem,5vw,3.2rem)] leading-[0.88] uppercase">
                  Read The Docs
                </h3>
                <p className="mt-4 text-balance font-mono text-sm leading-relaxed uppercase tracking-[0.08em] text-foreground/92">
                  Use this path if you want to install, wire providers, and
                  define commands manually.
                </p>

                <a
                  href="https://better-cmdk.com/docs"
                  className="mt-6 inline-flex items-center gap-2 border-4 border-foreground bg-card px-4 py-3 font-mono text-xs uppercase tracking-[0.14em] transition-transform hover:-translate-y-1"
                >
                  Open Setup Docs
                  <ArrowUpRight className="size-4" />
                </a>

                <div className="mt-6 border-2 border-foreground bg-secondary p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/88">
                    Best For
                  </p>
                  <p className="mt-3 text-balance font-mono text-xs leading-relaxed uppercase tracking-[0.08em] text-foreground/92">
                    Teams with strict review flows or custom architecture
                    decisions.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-10 border-t-4 border-foreground bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
          <div className="border-4 border-background">
            <div className="border-b-2 border-background px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-background/82 sm:px-6 sm:py-3">
              Built By The Dynamic UI Company
            </div>

            <a
              href="https://modifywithai.com"
              className="group block border-b-4 border-background px-4 pt-5 pb-4 transition-colors hover:bg-background hover:text-foreground sm:px-6 sm:pt-7 sm:pb-6"
            >
              <span className="font-display block text-[clamp(3.3rem,15vw,9.6rem)] leading-[0.76] tracking-[-0.03em]">
                BETTER-CMDK
              </span>
              <span className="mt-2 inline-flex border-2 border-current px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em]">
                React Command + AI Surface
              </span>
            </a>

            <div className="grid sm:grid-cols-4">
              <a
                href="https://better-cmdk.com/docs"
                className="inline-flex items-center justify-between border-b-2 border-background px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors hover:bg-background hover:text-foreground sm:border-b-0 sm:border-r-2 sm:px-5 sm:py-4"
              >
                Setup Docs
                <ArrowUpRight className="size-4" />
              </a>
              <Link
                href="/integrations"
                className="inline-flex items-center justify-between border-b-2 border-background px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors hover:bg-background hover:text-foreground sm:border-b-0 sm:border-r-2 sm:px-5 sm:py-4"
              >
                Integrations
                <ArrowUpRight className="size-4" />
              </Link>
              <a
                href="https://github.com/ModifyWithAI/better-cmdk"
                className="inline-flex items-center justify-between border-b-2 border-background px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors hover:bg-background hover:text-foreground sm:border-b-0 sm:border-r-2 sm:px-5 sm:py-4"
              >
                GitHub Repo
                <ArrowUpRight className="size-4" />
              </a>
              <a
                href="https://modifywithai.com"
                className="inline-flex items-center justify-between px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors hover:bg-background hover:text-foreground sm:px-5 sm:py-4"
              >
                modifywithai.com
                <ArrowUpRight className="size-4" />
              </a>
            </div>

            <div className="border-t-4 border-background px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-background/84 sm:px-6">
              © 2026 The Dynamic UI Company
            </div>
          </div>
        </div>
      </footer>

      <CommandMenu
        open={open}
        onOpenChange={setOpen}
        chatEndpoint="/api/chat"
        commands={commands}
        commandsPlaceholder="Search commands or ask AI..."
        corners="none"
        borderColor="hsl(var(--foreground))"
        className="!bg-card !shadow-none"
      />

      {showSetupModal ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            aria-label="Close setup instructions"
            className="absolute inset-0 bg-foreground/45"
            onClick={() => setShowSetupModal(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="setup-modal-title"
            className="relative z-10 w-full max-w-5xl border-4 border-foreground bg-background p-8 sm:p-10"
          >
            <p className="inline-flex border-2 border-foreground bg-secondary px-2 py-1 font-mono text-sm uppercase tracking-[0.14em] text-foreground">
              AI Setup Instructions
            </p>
            <h3
              id="setup-modal-title"
              className="font-display mt-5 text-balance text-[clamp(2rem,6vw,4rem)] leading-[0.86] uppercase"
            >
              Prompt Copied
            </h3>

            <p className="mt-5 text-balance font-mono text-base leading-relaxed uppercase tracking-[0.08em] text-foreground/92">
              Paste the prompt into your coding agent, then follow these steps.
            </p>

            <ol className="mt-8 space-y-4 font-mono text-base leading-relaxed uppercase tracking-[0.08em] text-foreground/92">
              <li>1. Open your project in your coding agent.</li>
              <li>2. Paste the copied AI setup prompt into a new task/chat.</li>
              <li>
                3. Let the agent setup better-cmdk.
              </li>
              <li>
                4. Answer the agent&apos;s follow-up questions and review the
                resulting changes.
              </li>
            </ol>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowSetupModal(false);
                  scrollTo(setupRef);
                }}
                className="inline-flex items-center gap-2 border-4 border-foreground bg-foreground px-4 py-3 font-mono text-sm uppercase tracking-[0.12em] text-background transition-transform hover:-translate-y-1"
              >
                Back To Setup Options
              </button>

              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="inline-flex items-center gap-2 border-4 border-foreground bg-card px-4 py-3 font-mono text-sm uppercase tracking-[0.12em] transition-transform hover:-translate-y-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className={`pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 border-4 border-foreground bg-background px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] transition-all duration-200 ${
          showCopyToast
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }`}
      >
        {toastMessage}
      </div>
    </div>
  );
}
