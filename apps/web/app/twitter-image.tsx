import { createSocialImage } from "./lib/social-image";

export const alt = "better-cmdk";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function TwitterImage() {
  return createSocialImage({
    eyebrow: "BETTER-CMDK",
    headline: "COMMAND MENU",
    subheadline: "AI CHAT + TOOL APPROVALS FOR REACT",
    footerLeft: "better-cmdk.com",
    footerRight: "OPEN SOURCE",
  });
}
