export const siteConfig = {
  name: "better-cmdk",
  legalName: "The Dynamic UI Company",
  description:
    "better-cmdk is a React command palette with AI chat, action approvals, and provider-agnostic integration.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://better-cmdk.com").replace(
    /\/+$/,
    "",
  ),
};

export const siteUrl = siteConfig.url;
export const siteUrlObject = new URL(siteUrl);
