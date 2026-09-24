import type { MetadataRoute } from "next";
import brand90 from "./assets/logos/SidebarPNG.png";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "90 MINUTES",
    short_name: "90 MINUTES",
    description: "Costruisci una squadra. Gestisci persone.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0b0f0e",
    theme_color: "#242829",
    categories: ["games", "sports"],
    icons: [
      {
        src: brand90.src,
        sizes: "any",
        type: "image/png",
        purpose: "any"
      }
    ]
  };
}
