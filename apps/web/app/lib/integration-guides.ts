export type IntegrationGuide = {
  slug: string;
  providerName: string;
  keyword: string;
  pageTitle: string;
  metaDescription: string;
  heroSummary: string;
  intro: string;
  bestFor: string[];
  setupChecklist: string[];
  approvalChecklist: string[];
  commonPitfalls: string[];
  faqs: { question: string; answer: string }[];
};

export const integrationGuides: IntegrationGuide[] = [
  {
    slug: "modifywithai",
    providerName: "modifywithai.com",
    keyword: "better-cmdk modifywithai integration",
    pageTitle: "better-cmdk + modifywithai.com Integration Guide",
    metaDescription:
      "Integrate better-cmdk with modifywithai.com to run agentic actions with approval gates in your React app.",
    heroSummary:
      "Use modifywithai.com when you want AI chat that can execute real app actions, not just answer questions.",
    intro:
      "This setup is the fastest path to an agentic command menu. You connect one assistant object, expose safe actions, and let users approve sensitive runs before execution.",
    bestFor: [
      "Internal tools where users need AI to execute workflows",
      "Teams that want approval prompts before destructive actions",
      "Products that need both command search and agentic chat in one surface",
    ],
    setupChecklist: [
      "Install better-cmdk and modifywithai using the package manager already used in your repo.",
      "Create and configure the modifywithai token endpoint for your app.",
      "Define action contracts with clear names, required options, and deterministic execute handlers.",
      "Pass the assistant object to CommandMenu and verify command mode and chat mode both work.",
    ],
    approvalChecklist: [
      "Require approvals on write, delete, billing, and permission actions.",
      "Show a preview of changed records before approval where possible.",
      "Log approved vs rejected actions for operational visibility.",
    ],
    commonPitfalls: [
      "Action labels are vague, so users cannot find the right command quickly.",
      "Destructive actions run without an explicit confirmation checkpoint.",
      "Context payloads are missing key state, so AI responses are generic.",
    ],
    faqs: [
      {
        question: "Do I need modifywithai.com to use better-cmdk?",
        answer:
          "No. better-cmdk works as a command palette without AI. modifywithai.com is an optional path for agentic execution.",
      },
      {
        question: "When should I add approval prompts?",
        answer:
          "Use approvals for any action that writes data, changes permissions, or can cause irreversible side effects.",
      },
      {
        question: "Can I keep manual commands and AI actions in one list?",
        answer:
          "Yes. Define actions once and reuse that same set for command search and AI-triggered runs.",
      },
    ],
  },
  {
    slug: "vercel-ai-sdk",
    providerName: "Vercel AI SDK",
    keyword: "better-cmdk vercel ai sdk integration",
    pageTitle: "better-cmdk + Vercel AI SDK Integration Guide",
    metaDescription:
      "Connect better-cmdk to a Vercel AI SDK chat endpoint for streaming chat in your React command menu.",
    heroSummary:
      "Use this path when you want a clean streaming chat endpoint and full control over model/provider selection.",
    intro:
      "This setup keeps your AI pipeline inside your own API route. better-cmdk handles command UX while your endpoint handles models, prompts, and provider configuration.",
    bestFor: [
      "Teams already shipping Vercel AI SDK routes",
      "Apps that need provider flexibility without changing UI components",
      "Products that want chat in the command menu before adding agentic actions",
    ],
    setupChecklist: [
      "Install better-cmdk with ai and @ai-sdk/react dependencies.",
      "Create app/api/chat/route.ts with streaming response support.",
      "Pass chatEndpoint to CommandMenu and test responses in both themes.",
      "Add request logging and rate limits before production rollout.",
    ],
    approvalChecklist: [
      "Gate any tool-calling branch with explicit approval UI.",
      "Require auth on the chat endpoint for signed-in product surfaces.",
      "Validate all action arguments server-side before execution.",
    ],
    commonPitfalls: [
      "The chat endpoint returns non-stream responses, causing a degraded UI experience.",
      "Rate limiting is skipped, so bots can exhaust model quotas.",
      "System prompts are too broad and do not reflect app-specific constraints.",
    ],
    faqs: [
      {
        question: "Can I start with chatEndpoint and add actions later?",
        answer:
          "Yes. Many teams begin with chat only, then add structured actions and approval rules incrementally.",
      },
      {
        question: "Does this lock me to one model provider?",
        answer:
          "No. You can switch model providers in your route without changing CommandMenu wiring.",
      },
      {
        question: "Should chatEndpoint be public?",
        answer:
          "Only for public surfaces. Authenticated product routes should enforce user identity and rate limits.",
      },
    ],
  },
  {
    slug: "custom-external-chat",
    providerName: "Custom ExternalChat",
    keyword: "better-cmdk custom externalchat integration",
    pageTitle: "better-cmdk + Custom ExternalChat Integration Guide",
    metaDescription:
      "Implement a custom ExternalChat adapter for better-cmdk to connect any internal or third-party AI backend.",
    heroSummary:
      "Use a custom ExternalChat adapter when your organization already has an internal chat orchestration layer.",
    intro:
      "This path gives maximum control. You implement the provider contract once, then keep better-cmdk as the stable UI layer while backend providers evolve.",
    bestFor: [
      "Teams with internal model gateways and compliance requirements",
      "Products that need custom routing between multiple models",
      "Engineering orgs standardizing one chat API across many apps",
    ],
    setupChecklist: [
      "Implement the ExternalChat-compatible adapter in your shared frontend layer.",
      "Map request and response events to better-cmdk chat expectations.",
      "Attach adapter telemetry for prompt, latency, and failure analysis.",
      "Test fallback behavior when provider timeouts or quota errors occur.",
    ],
    approvalChecklist: [
      "Keep approval logic in UI for user trust and in server for enforcement.",
      "Reject malformed action arguments before any side effect happens.",
      "Return structured error messages so users can retry safely.",
    ],
    commonPitfalls: [
      "Adapter responses are not normalized, leading to inconsistent rendering.",
      "Error states are hidden, so users do not understand failed actions.",
      "Internal provider changes break the adapter due to missing contract tests.",
    ],
    faqs: [
      {
        question: "Is a custom adapter harder to maintain?",
        answer:
          "It is more work initially, but it reduces long-term UI churn when backend providers change.",
      },
      {
        question: "Can I connect multiple providers through one adapter?",
        answer:
          "Yes. You can route by tenant, feature flag, or request type inside your adapter layer.",
      },
      {
        question: "What should I test before launch?",
        answer:
          "Test streaming behavior, auth failures, retries, and action approval flows under real latency.",
      },
    ],
  },
  {
    slug: "self-hosted-endpoint",
    providerName: "Self-hosted endpoint",
    keyword: "better-cmdk self hosted ai endpoint integration",
    pageTitle: "better-cmdk + Self-hosted Endpoint Integration Guide",
    metaDescription:
      "Use better-cmdk with a self-hosted AI endpoint for strict network, compliance, and model-control requirements.",
    heroSummary:
      "Use a self-hosted endpoint when data residency, private networking, or compliance controls are required.",
    intro:
      "This approach keeps inference traffic on infrastructure you control. better-cmdk still handles command/search/chat UX while your endpoint enforces policy and model access.",
    bestFor: [
      "Organizations with private network or compliance boundaries",
      "Apps that must keep prompts and context on controlled infrastructure",
      "Teams running open-weight models in dedicated environments",
    ],
    setupChecklist: [
      "Expose a stable internal chat endpoint with streaming support.",
      "Secure endpoint access with auth, origin checks, and request limits.",
      "Connect CommandMenu through chatEndpoint or an adapter layer.",
      "Instrument latency and error metrics before opening to broad traffic.",
    ],
    approvalChecklist: [
      "Keep write actions behind explicit user approval.",
      "Validate permissions for every action on the server, not only in UI.",
      "Store audit events for executed actions and acting user identity.",
    ],
    commonPitfalls: [
      "No streaming support, resulting in slow perceived response times.",
      "Security headers and auth checks are incomplete on internal routes.",
      "Model upgrades are untracked, causing unpredictable behavior changes.",
    ],
    faqs: [
      {
        question: "Can self-hosted still use the same UI components?",
        answer:
          "Yes. better-cmdk UI stays the same as long as the endpoint contract remains compatible.",
      },
      {
        question: "What is the minimum production hardening?",
        answer:
          "Authentication, rate limiting, structured logs, and server-side action permission checks.",
      },
      {
        question: "Should I expose the endpoint publicly?",
        answer:
          "Only if required. Most teams keep it behind application auth and controlled network access.",
      },
    ],
  },
];

export function getIntegrationGuide(slug: string): IntegrationGuide | undefined {
  return integrationGuides.find((guide) => guide.slug === slug);
}

