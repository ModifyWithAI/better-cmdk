import { createSocialImage } from "./lib/social-image";

export const alt = "better-cmdk";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpengraphImage() {
  return createSocialImage({
    eyebrow: "AI COMMAND MENU FOR REACT",
    headline: "BETTER-CMDK",
    subheadline: "COMMAND. CHAT. EXECUTE. ONE SURFACE.",
    footerLeft: "better-cmdk.com",
    footerRight: "THE DYNAMIC UI COMPANY",
  });
}
