import type { MetadataRoute } from "next";
import { siteConfig } from "./lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "better-cmdk",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f8f6ed",
    theme_color: "#121212",
    icons: [
      {
        src: "/icon.png",
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
  };
}

